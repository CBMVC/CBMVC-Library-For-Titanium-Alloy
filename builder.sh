
#!/bin/sh
#titanium clean
#alloy compile --config platform=android
argument1="$1"
argument2="$2"
#show the help message
if [ "$argument1" = "?" ]; then
    echo "           ";
    echo "|------------------------------";
    echo "| First Argument:";
    echo "| ?                : show help information";
    echo "| Number (1,2,3...): the last number of device's IP address.Default is 1";
    echo "|           ";
    echo "| Second Argument:";
    echo "| null             : if null this argument, then just install apk to emulator";
    echo "| b                : build the project and install apk to emulator";
    echo "| cb               : clean the project and build it and install to emulator";
    echo "| l                : just show the adb logcat console";
    echo "|------------------------------";
    echo "           ";
else
    if [ -z "$argument1" ]; then
        argument1=1
    fi
    if [ "$argument2" = "l" ]; then
        #show the console information
        ruby /Volumes/SourceCodes/adb-logcat-color.rb -s 192.168.56.10$argument1:5555;
    else
        if [ "$argument2" = "b" ]; then
            titanium build --platform android --sdk 3.1.2.GA --build-only;
        elif [ "$argument2" = "cb" ]; then
            titanium clean;
            titanium build --platform android --sdk 3.1.2.GA --build-only;
        fi

        #adb install -r build/android/bin/app.apk
        adb -s 192.168.56.10$argument1:5555 install -r build/android/bin/app.apk
        adb -s 192.168.56.10$argument1:5555 shell am start -a android.intent.action.MAIN -n cbmvcalloy.com/.Cbmvc_alloyActivity
    fi
fi
