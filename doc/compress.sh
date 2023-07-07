ffmpeg -i runSelection_demo.mp4 -ss 00:00:00.000 -to 00:00:08.000 -vf "fps=10" -c:v gif runSelection_demo.gif
ffmpeg -i runCommand_demo.mp4 -ss 00:00:00.000 -to 00:00:12.000 -vf "fps=10" -c:v gif runCommand_demo.gif
# gifsicle -O3 runCommand_demo_12s.gif -o runCommand_demo_12s_O3.gif
