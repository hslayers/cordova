module.exports = function(ctx) {
    // make sure android platform is part of build
    console.log('Hooking');
    
    var fs = ctx.requireCordovaModule('fs'),
        path = ctx.requireCordovaModule('path'),
        deferral = ctx.requireCordovaModule('q').defer();

        var deleteFolderRecursive = function(path) {
            if( fs.existsSync(path) ) {
                fs.readdirSync(path).forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
                });
                fs.rmdirSync(path);
            }
        };

    for(var x=0; x<ctx.opts.platforms.length; x++) {
        // open up the index.html file at the www root
        try {
            var platform = ctx.opts.platforms[x].trim().toLowerCase();
            var platformRoot = path.join(ctx.opts.projectRoot, 'platforms', platform);
            var wwwdir = '';
            if(platform=='android') wwwdir = path.join('assets', 'www');
            if(platform=='browser') wwwdir = path.join('www');
            var dirToDelete = path.join(platformRoot, wwwdir, 'components', 'lodexplorer');

            if(fs.existsSync(dirToDelete)) {
                console.log('Removing assets after prepare: ' + dirToDelete);
                deleteFolderRecursive(dirToDelete);
                console.log('done');
            }
            
            var fileToDel = path.join(platformRoot, wwwdir, 'bower_components', 'angular', 'angular.js');
            console.log(fileToDel);
            if(fs.existsSync(fileToDel)) {
                console.log('Removing assets after prepare: ' + fileToDel);
                fs.unlinkSync(fileToDel);
            }
        } catch(e) {
            process.stdout.write(e);
        }
    }
   

    return true;
};