def filter_person_detections(
    result,
    *,
    min_confidence=0.5,
    keypoint_confidence=0.5,
    min_visible_keypoints=4,
):
    """保留可信的人体框，并同步筛选关键点、跟踪 ID 等关联结果。

    这是 Pose 模型的质量过滤规则，不是通用的镜面识别算法。
    阈值需要按摄像头视角校准；遮挡或局部人体可能因关键点不足而被过滤。
    不限制目标总数，多个满足条件的人仍然会同时保留。
    """
    boxes = result.boxes
    if boxes is None or len(boxes) == 0:
        return result

    keep = (boxes.cls == 0) & (boxes.conf >= min_confidence)
    if min_visible_keypoints > 0:
        keypoints = result.keypoints
        if keypoints is None or keypoints.conf is None:
            return result[[]]
        visible = (keypoints.conf >= keypoint_confidence).sum(dim=1)
        keep &= visible >= min_visible_keypoints

    indices = keep.nonzero(as_tuple=False).flatten().cpu().tolist()
    return result[indices]
