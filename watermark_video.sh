# Script to add watermark to a video with ffmpeg
ffmpeg -i media/video.mp4 -vf "drawtext=text='Legado Digital':fontcolor=white:fontsize=24:x=10:y=H-th-10" -codec:a copy media/video_watermark.mp4
