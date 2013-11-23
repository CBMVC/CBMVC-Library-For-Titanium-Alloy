#文件名 ： builder.sh
#执行方法：直接在终端运行 sh builder.sh

#!/bin/bash
#可先清理一次项目
#titanium clean;
#可将alloy项目重新编译一次先
#alloy compile --config platform=android;
titanium build --platform android --sdk 3.1.3.GA --build-only;

#adb install -r build/android/bin/app.apk
adb -s 192.168.56.101:5555 install -r build/android/bin/app.apk;

#这句可以自动运行安装好的apk应用
adb -s 192.168.56.101:5555 shell am start -a android.intent.action.MAIN -n cbmvcalloy.com/.Cbmvc_alloyActivity

#运行着色脚本
#ruby /Volumes/SourceCodes/adb-logcat-color.rb

#显示控制台信息
#adb logcat TiAPI:I *:S;
#adb logcat TiAPI:D *:S;
