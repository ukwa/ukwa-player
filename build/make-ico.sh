convert ukwa-icon-2017-app.png  \
          \( -clone 0 -resize 16x16 \) \
          \( -clone 0 -resize 32x32 \) \
          \( -clone 0 -resize 48x48 \) \
          \( -clone 0 -resize 64x64 \) \
          \( -clone 0 -resize 128x128 \) \
          \( -clone 0 -resize 256x256 \) \
          -delete 0 icon.ico
