from pathlib import Path

import cv2
from ultralytics import YOLO
from person_filter import filter_person_detections

# --------------------------------------------------
# 1. 加载模型
# --------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
model = YOLO(str(BASE_DIR / "yolo11n-pose.pt"))

VIDEO_PATH = str(BASE_DIR / "media" / "fall-demo.mp4")

# track() 默认允许低置信度框参与跟踪，人数统计需要更严格的质量过滤。
DETECTION_CONFIDENCE = 0.5
NMS_IOU_THRESHOLD = 0.5
KEYPOINT_CONFIDENCE = 0.5
MIN_VISIBLE_KEYPOINTS = 4

# 测试阶段先设置为5秒
# 正式运行以后可以改成60、120、180秒
STAY_THRESHOLD = 5

# 人离开画面超过多少秒，认为本次跟踪结束
LOST_RESET_SECONDS = 2


# --------------------------------------------------
# 2. 打开视频
# --------------------------------------------------
cap = cv2.VideoCapture(VIDEO_PATH)

if not cap.isOpened():
    print("无法打开视频")
    exit()

fps = cap.get(cv2.CAP_PROP_FPS)

if fps <= 0:
    fps = 25

print("视频 FPS：", fps)
print("Persons 表示当前帧有效人数；Track ID 是轨迹编号，不是累计人数。")


# --------------------------------------------------
# 3. 保存人员状态
# --------------------------------------------------

# 第一次发现该人员的时间
first_seen = {}

# 最近一次发现该人员的时间
last_seen = {}

# 已经触发过异常滞留的人员
reported = set()

frame_index = 0


# --------------------------------------------------
# 4. 视频检测
# --------------------------------------------------
while cap.isOpened():

    ret, frame = cap.read()

    if not ret:
        break

    frame_index += 1

    # 这里使用视频本身的时间，而不是电脑真实时间
    # 否则电脑处理视频过快时，停留时间会不准确
    current_time = frame_index / fps


    # --------------------------------------------------
    # YOLO + ByteTrack
    # --------------------------------------------------
    results = model.track(
        frame,
        persist=True,
        tracker="bytetrack.yaml",
        conf=DETECTION_CONFIDENCE,
        iou=NMS_IOU_THRESHOLD,
        classes=[0],
        verbose=False
    )

    # 先过滤，再统一用于计数、绘图和停留计时，避免三处使用不同口径。
    result = filter_person_detections(
        results[0],
        min_confidence=DETECTION_CONFIDENCE,
        keypoint_confidence=KEYPOINT_CONFIDENCE,
        min_visible_keypoints=MIN_VISIBLE_KEYPOINTS,
    )

    boxes = result.boxes

    current_person_count = 0

    active_ids = set()

    # YOLO绘制结果
    annotated_frame = result.plot()


    # --------------------------------------------------
    # 5. 获取Track ID
    # --------------------------------------------------
    if boxes is not None:

        current_person_count = len(boxes)

        if boxes.id is not None:

            track_ids = boxes.id.int().cpu().tolist()

            coordinates = boxes.xyxy.cpu().tolist()

            for track_id, box in zip(track_ids, coordinates):

                active_ids.add(track_id)

                # 第一次看到这个人
                if track_id not in first_seen:

                    first_seen[track_id] = current_time

                    print(
                        f"建立跟踪轨迹 Track ID={track_id}"
                    )

                # 更新最后出现时间
                last_seen[track_id] = current_time


                # --------------------------------------------------
                # 计算停留时间
                # --------------------------------------------------
                stay_time = (
                    current_time
                    - first_seen[track_id]
                )

                print(
                    f"人员 ID={track_id} "
                    f"已停留 {stay_time:.1f} 秒"
                )


                # --------------------------------------------------
                # 6. 判断异常滞留
                # --------------------------------------------------
                if stay_time >= STAY_THRESHOLD:

                    # 防止每一帧都重复报警
                    if track_id not in reported:

                        print(
                            "\n"
                            "=============================="
                        )

                        print(
                            f"⚠ 检测到异常滞留！"
                        )

                        print(
                            f"人员 ID：{track_id}"
                        )

                        print(
                            f"停留时间："
                            f"{stay_time:.1f} 秒"
                        )

                        print(
                            "=============================="
                            "\n"
                        )

                        reported.add(track_id)


                # --------------------------------------------------
                # 在视频画面显示ID和时间
                # --------------------------------------------------
                x1, y1, x2, y2 = map(
                    int,
                    box
                )

                text = (
                    f"ID:{track_id} "
                    f"Stay:{stay_time:.1f}s"
                )

                cv2.putText(
                    annotated_frame,
                    text,
                    (x1, max(y1 - 10, 20)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 255),
                    2
                )


    # --------------------------------------------------
    # 7. 清理已经离开的人员
    # --------------------------------------------------
    remove_ids = []

    for track_id in list(last_seen.keys()):

        if (
            current_time
            - last_seen[track_id]
            > LOST_RESET_SECONDS
        ):

            remove_ids.append(track_id)

    for track_id in remove_ids:

        print(
            f"人员 ID={track_id} 已离开"
        )

        first_seen.pop(
            track_id,
            None
        )

        last_seen.pop(
            track_id,
            None
        )

        reported.discard(
            track_id
        )


    # --------------------------------------------------
    # 8. 显示当前人数
    # --------------------------------------------------
    cv2.putText(
        annotated_frame,
        f"Persons: {current_person_count}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )


    cv2.imshow(
        "Elevator AI - Stay Detection",
        annotated_frame
    )


    # 按 q 退出
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


cap.release()

cv2.destroyAllWindows()
