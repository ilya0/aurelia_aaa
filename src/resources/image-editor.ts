export class ImageEditor {
    static resize(file, options?) {
        options = Object.assign({
            width: 400,
            height: 400,
            quality: 0.85,
            size: 'contain'
        }, options);
        return new Promise((resolve, reject) => {
            var canvas = document.createElement('canvas');
            var reader = new FileReader();
            reader.onloadend = (e) => {
                var img = new Image();
                img.onload = () => {
                    var w = img.width;
                    var h = img.height;
                    var ratio_w = 1;
                    var ratio_h = 1;
                    if (w > options.width) {
                        ratio_w = options.width / w;
                    }
                    if (h > options.height) {
                        ratio_h = options.height / h;
                    }

                    var ratio = Math.min(ratio_w, ratio_h);
                    w = Math.floor(w * ratio);
                    h = Math.floor(h * ratio);
                    canvas.width = w;
                    canvas.height = h;
                    var ctx = canvas.getContext('2d', { preserveDrawingBuffer: true });
                    ctx.drawImage(img, 0, 0, w, h);

                    var dataURL = canvas.toDataURL('image/jpeg', 0.85);
                    var a = dataURL.split(',')[1];
                    var blob = atob(a);
                    var array = [];
                    for (var k = 0; k < blob.length; k++) {
                        array.push(blob.charCodeAt(k));
                    }
                    // Object.keys(file).forEach((key) => console.log(key, file[key]));
                    var data = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
                    if (file.hasOwnProperty('name')) data['name'] = file['name'];
                    // if (file.hasOwnProperty('accepted')) data['accepted'] = file['accepted'];
                    // if (file.hasOwnProperty('previewElement')) data['previewElement'] = file['previewElement'];
                    // if (file.hasOwnProperty('previewTemplate')) data['previewTemplate'] = file['previewTemplate'];
                    // if (file.hasOwnProperty('status')) data['status'] = file['status'];
                    // if (file.hasOwnProperty('upload')) {
                    //     data['upload'] = file['upload'];
                    //     data['upload']['total'] = data.size;
                    // }
                    data['width'] = w;
                    data['height'] = h;
                    data['resizeComplete'] = true;
                    // if (data['upload']) data['upload']['total'] = data.size;
                    // file = <DropzoneFile>data;
                    console.log('resize done', data);
                    resolve({ file: data, dataURL: dataURL });
                    // (<HTMLElement>file.previewElement.querySelector('.dz-thumbnail')).style.backgroundImage = 'url(' + dataURL + ')';
                };
                img.src = reader.result; //e.target.result;
            }
            reader.readAsDataURL(file);
        });
    }
}

// export class ResizeOptions {
//     constructor(public width: number, public height: number, public quality: number = 0.85, public size: string = 'contain') { }
// }
