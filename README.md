# HSLayers-NG Cordova mobile application

Apache Cordova is a framework used to develop mobile applications using HTML, CSS and JavaScript. Applications built using Cordova and HSLayers-NG deliver the desktop HSL experience to the mobile platform.

Check out the example to get the idea:  
[https://play.google.com/store/apps/details?id=com.sdi4apps.thematicmaps](https://play.google.com/store/apps/details?id=com.sdi4apps.thematicmaps)

## Getting Started

To get you started you will need to clone the hslayers-ng and cordova repository (optionally clone just the main application thematicMaps), install the dependencies and to build application packages you will also need to install Apache Cordova, Java Development Kit (JDK), Android SDK and its packages corresponding to your Cordova version:

### Prerequisites

You need git to clone the hslayers-ng and cordova repository. You can get it from
[http://git-scm.com/](http://git-scm.com/).

Hslayers-ng has a number of node.js tools to initialize and test itself. You must have node.js and
its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

Then you will need [Java Development Kit](http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html) and [Android Studio or Android SDK](https://developer.android.com/studio/index.html) and set your `JAVA_HOME`, `ANDROID_HOME` environment variables to the location of your JDK and Android SDK installation directories. It is also recommended to add the `tools` and `platform-tools` directories of the Android SDK installation to your `PATH`.

You can also check the more detailed [guide](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html).


### Configure HSLayers-NG

Refer to README.md in the [hslayers-ng repository](https://github.com/hslayers/hslayers-ng) for instructions on how to configure this repository.

### Configure your Cordova repo

Either clone the whole repository (to the same folder as your hslayers-ng repo):

```
git clone git@github.com:hslayers/cordova.git
```

or clone only the master thematicMaps application using **sparse checkout** (also to the same folder as your hslayers-ng repo):

```
mkdir cordova
cd cordova
git init
git remote add -f origin git@github.com:hslayers/cordova.git
git config core.sparseCheckout true
echo "thematicMaps/" >> .git/info/sparse-checkout
```

optionally add any further application examples you want:

```
echo "anotherExample/" >> .git/info/sparse-checkout
```

and finally pull the files:

```
git pull origin master
```

Create following symbolic links in your `thematicMaps/www/` directory:

* `hslayers-ng/components`
* `hslayers-ng/css/font`
* `hslayers-ng/css/whhg-font`
* `hslayers-ng/css/app.css`

```
ln -s <hslayers-ng location>/components components
ln -s <hslayers-ng location>/css/font css/font
ln -s <hslayers-ng location>/css/whhg-font css/whhg-font
ln -s <hslayers-ng location>/css/app.css css/app.css
```

### Configure your Cordova app

Next copy the master `thematicMaps` application as your new application:

```
cp thematicMaps myApp
```

Remove the files and create symbolic links that should be based on the master example:

```
rm myApp/www/js/hslayers.js myApp/www/css/mobile.css myApp/www/bower_components myApp/www/node_modules
ln -s thematicMaps/www/js/hslayers.js myApp/www/js/hslayers.js
ln -s thematicMaps/www/css/mobile.css myApp/www/css/mobile.css
ln -s thematicMaps/www/bower_components myApp/www/bower_components
ln -s thematicMaps/www/node_modules myApp/www/node_modules
```

After that you just need to add your target platform (only Android supported at the moment) with:

```
cordova platform add <platform>
```
which will also check for any plugins necessary for running the application and download them to your project.

Then update your info in the `config.xml` file, optionally update your icons in the `res` folder and you are ready for your first build!

### Building application packages

In the folder of your app, run:

```
cordova build <platform>
```

to build a debugging package of your app for the required <platform> (e.g. android).

substitute for `cordova run <platform>` if you wish to build the package and install it to emulator or `cordova run <platform> --device` to install to a device connected via adb (use `--skip-build` flag if you already built the package).

You can check whether your device is connected by `adb devices`.  If not, you will need to install drivers for your device (on Windows) or add `udev` rules for your device on Linux following this [guide](https://developer.android.com/studio/run/device.html).

## Contact

leitgeb.simon@gmail.com
