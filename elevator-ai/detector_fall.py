import cv2
from collections import defaultdict, deque
from ultralytics import YOLO


# =========================================================
# 1. 参数
# =========================================================

VIDEO_PATH = "media/fall-demo.mp4"

# 使用 Pose 模型
model = YOLO("yolo11n-pose.pt")


# 倒地姿态需要持续多久才报警
FALL_CONFIRM_TIME = 1.2

# 人体丢失多久清理状态
LOST_RESET_TIME = 2.0

# 身体框宽高比
# > 0.9 表示人体开始明显横向
BOX_RATIO_THRESHOLD = 0.9

# 躯干水平程度
# dx > dy * 1.1 时认为躯干偏水平
TORSO_HORIZONTAL_RATIO = 1.1

# 短时间内中心向下移动多少比例认为出现明显下降
DROP_THRESHOLD = 0.12

# 用多长时间观察下降趋势
DROP_WINDOW_SECONDS = 0.6


# =========================================================
# 2. 视频
# =========================================================

cap = cv2.VideoCapture(VIDEO_PATH)

if not cap.isOpened():
    print("无法打开视频：", VIDEO_PATH)
    exit()

fps = cap.get(cv2.CAP_PROP_FPS)

if fps <= 0:
    fps = 25.0

print("视频 FPS：", fps)


# =========================================================
# 3. 每个人的状态
# =========================================================

# 开始出现疑似倒地姿态的时间
fall_candidate_start = {}

# 最近一次看到该人的时间
last_seen = {}

# 已经报警过，避免重复报警
reported = set()

# 保存人体中心Y坐标历史
center_y_history = defaultdict(
    lambda: deque(maxlen=max(5, int(fps * DROP_WINDOW_SECONDS)))
)

frame_index = 0


# =========================================================
# 4. 开始检测
# =========================================================

while cap.isOpened():

    ret, frame = cap.read()

    if not ret:
        break

    frame_index += 1

    # MP4 使用视频时间
    current_time = frame_index / fps

    frame_height, frame_width = frame.shape[:2]


    # -----------------------------------------------------
    # YOLO Pose + ByteTrack
    # -----------------------------------------------------

    results = model.track(
        frame,
        persist=True,
        tracker="bytetrack.yaml",
        verbose=False
    )

    result = results[0]

    annotated = result.plot()

    boxes = result.boxes
    keypoints = result.keypoints


    # =====================================================
    # 5. 获取人员信息
    # =====================================================

    if (
        boxes is not None
        and boxes.id is not None
        and keypoints is not None
        and keypoints.xy is not None
    ):

        ids = boxes.id.int().cpu().tolist()
        box_list = boxes.xyxy.cpu().tolist()
        kp_list = keypoints.xy.cpu().tolist()

        # 某些模型/版本存在 confidence
        kp_conf_list = None

        if keypoints.conf is not None:
            kp_conf_list = keypoints.conf.cpu().tolist()


        for i, (track_id, box, kp) in enumerate(
            zip(ids, box_list, kp_list)
        ):

            last_seen[track_id] = current_time

            x1, y1, x2, y2 = box

            width = x2 - x1
            height = y2 - y1

            if height <= 0:
                continue


            # =================================================
            # A. 人体框宽高比
            # =================================================

            box_ratio = width / height

            box_horizontal = (
                box_ratio >= BOX_RATIO_THRESHOLD
            )


            # =================================================
            # B. 获取肩和髋关键点
            # COCO：
            # 5 left shoulder
            # 6 right shoulder
            # 11 left hip
            # 12 right hip
            # =================================================

            left_shoulder = kp[5]
            right_shoulder = kp[6]

            left_hip = kp[11]
            right_hip = kp[12]


            # -------------------------------------------------
            # 检查关键点置信度
            # -------------------------------------------------

            keypoints_valid = True

            if kp_conf_list is not None:

                conf = kp_conf_list[i]

                important_conf = [
                    conf[5],
                    conf[6],
                    conf[11],
                    conf[12]
                ]

                # 关键点太不可靠
                if min(important_conf) < 0.25:
                    keypoints_valid = False


            torso_horizontal = False


            if keypoints_valid:

                shoulder_x = (
                    left_shoulder[0]
                    + right_shoulder[0]
                ) / 2

                shoulder_y = (
                    left_shoulder[1]
                    + right_shoulder[1]
                ) / 2

                hip_x = (
                    left_hip[0]
                    + right_hip[0]
                ) / 2

                hip_y = (
                    left_hip[1]
                    + right_hip[1]
                ) / 2


                torso_dx = abs(
                    shoulder_x - hip_x
                )

                torso_dy = abs(
                    shoulder_y - hip_y
                )


                # 正常站立：
                # torso_dy 大
                #
                # 倒地：
                # torso_dx 增大，torso_dy 减小
                torso_horizontal = (
                    torso_dx
                    > torso_dy * TORSO_HORIZONTAL_RATIO
                )


            # =================================================
            # C. 判断人体是否快速向下移动
            # =================================================

            center_y = (y1 + y2) / 2

            normalized_center_y = (
                center_y / frame_height
            )

            center_y_history[track_id].append(
                normalized_center_y
            )


            rapid_drop = False

            history = center_y_history[track_id]

            if len(history) >= 4:

                old_y = history[0]
                new_y = history[-1]

                movement = new_y - old_y

                # 图像坐标Y越大代表越靠下
                if movement >= DROP_THRESHOLD:
                    rapid_drop = True


            # =================================================
            # D. 综合判断疑似倒地姿态
            # =================================================

            #
            # 不建议简单写：
            #
            # if width > height:
            #
            # 而是综合：
            #
            # 人体框横向
            # +
            # 躯干横向
            #
            posture_fall = (
                box_horizontal
                and torso_horizontal
            )


            # =================================================
            # E. 倒地候选
            # =================================================

            # rapid_drop 在真实数据中可能不稳定，
            # 所以这里把它作为辅助信息，
            # 不作为绝对必要条件。

            if posture_fall:

                if track_id not in fall_candidate_start:

                    fall_candidate_start[
                        track_id
                    ] = current_time


                duration = (
                    current_time
                    - fall_candidate_start[
                        track_id
                    ]
                )


                # -------------------------------------------------
                # 持续超过阈值
                # -------------------------------------------------

                if (
                    duration >= FALL_CONFIRM_TIME
                    and track_id not in reported
                ):

                    print()
                    print(
                        "=================================="
                    )

                    print(
                        "⚠ 检测到疑似人员倒地！"
                    )

                    print(
                        f"人员 ID：{track_id}"
                    )

                    print(
                        f"持续时间：{duration:.2f} 秒"
                    )

                    print(
                        f"人体框宽高比："
                        f"{box_ratio:.2f}"
                    )

                    print(
                        f"快速下降："
                        f"{'是' if rapid_drop else '否'}"
                    )

                    print(
                        "=================================="
                    )
                    print()

                    reported.add(track_id)


            else:

                # 恢复正常姿态
                fall_candidate_start.pop(
                    track_id,
                    None
                )


                # 如果希望同一个人以后再次倒地还能报警，
                # 恢复正常后可以重置报警状态
                reported.discard(
                    track_id
                )


            # =================================================
            # F. 在视频画面显示调试信息
            # =================================================

            x1i = int(x1)
            y1i = int(y1)

            status = "FALL?" if posture_fall else "Normal"

            debug_text = (
                f"ID:{track_id} "
                f"{status} "
                f"R:{box_ratio:.2f}"
            )

            cv2.putText(
                annotated,
                debug_text,
                (
                    x1i,
                    max(20, y1i - 10)
                ),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (
                    0,
                    0,
                    255
                ) if posture_fall else (
                    0,
                    255,
                    0
                ),
                2
            )


    # =====================================================
    # 6. 清理离开画面的人员
    # =====================================================

    remove_ids = []

    for track_id in list(last_seen.keys()):

        if (
            current_time
            - last_seen[track_id]
            > LOST_RESET_TIME
        ):

            remove_ids.append(track_id)


    for track_id in remove_ids:

        fall_candidate_start.pop(
            track_id,
            None
        )

        last_seen.pop(
            track_id,
            None
        )

        center_y_history.pop(
            track_id,
            None
        )

        reported.discard(
            track_id
        )


    # =====================================================
    # 7. 显示
    # =====================================================

    cv2.imshow(
        "Elevator AI - Fall Detection",
        annotated
    )


    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


cap.release()

cv2.destroyAllWindows()