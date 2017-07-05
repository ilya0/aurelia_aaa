import { customElement, autoinject, bindable } from 'aurelia-framework';
// import { Dropzone } from 'dropzone';
// import * as Dropzone from '../services/dropzone.js';
import { NetsuiteService } from './services/netsuite-service';
import { ApplicationState } from './application-state';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ImageEditor } from './resources/image-editor';

@autoinject
export class PrepressDropzone {
    @bindable transaction;
    @bindable version: any;
    @bindable fileinput: HTMLInputElement;
    @bindable dropzoneElement: HTMLElement;
    // @bindable canvasElement: HTMLCanvasElement;
    @bindable versionCanvasElement: HTMLCanvasElement;
    @bindable selectedVersion;
    @bindable dropzone: Dropzone;
    currentFile: DropzoneFile;
    awsFileKey;
    awsFileExt;

    constructor(public appState: ApplicationState, public netsuite: NetsuiteService, public eventAggregator: EventAggregator) {
    }

    attached(params, routeConfig) {
        // console.log('attached', this.dropzoneElement);
        // console.log(this.version.labelImage);
        this.dropzone = new Dropzone(this.dropzoneElement, {
            url: this.appState.labelImagesRootUrl,
            autoProcessQueue: true,
            clickable: false,
            acceptedFiles: 'image/*',
            createImageThumbnails: false,
            // addRemoveLinks: true,
            maxFiles: 2,
            maxFilesize: 10,
            // previewTemplate: this.dzPreview.innerHTML,
            previewTemplate: "<div class=\"dz-preview dz-file-preview\" style=\"margin:3px;\">\n  <div class=\"dz-details dz-thumbnail\" style=\"height:100px;width:100px;position:relative;background-size:contain;background-repeat:no-repeat;background-position:center center;\">\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n  <div class=\"dz-success-mark\">\n    <svg width=\"54px\" height=\"54px\" viewBox=\"0 0 54 54\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n      <title>Check</title>\n      <defs></defs>\n      <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\">\n        <path d=\"M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z\" id=\"Oval-2\" stroke-opacity=\"0.198794158\" stroke=\"#747474\" fill-opacity=\"0.816519475\" fill=\"#FFFFFF\" sketch:type=\"MSShapeGroup\"></path>\n      </g>\n    </svg>\n  </div>\n  <div class=\"dz-error-mark\">\n    <svg width=\"54px\" height=\"54px\" viewBox=\"0 0 54 54\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n      <title>Error</title>\n      <defs></defs>\n      <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\">\n        <g id=\"Check-+-Oval-2\" sketch:type=\"MSLayerGroup\" stroke=\"#747474\" stroke-opacity=\"0.198794158\" fill=\"#FFFFFF\" fill-opacity=\"0.816519475\">\n          <path d=\"M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z\" id=\"Oval-2\" sketch:type=\"MSShapeGroup\"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n</div>",
            accept: (file: DropzoneFile, done) => {
                console.log('accept start', 'file count:', this.dropzone.files.length, this.dropzone.files[0].name);
                // if (this.dropzone.files.length) this.dropzone.removeFile(this.dropzone.files[0]);
                // if (this.currentFile) this.dropzone.removeFile(this.currentFile);
                // file['done'] = done;

                if (file['resizeComplete']) {
                    if (this.currentFile) this.dropzone.removeFile(this.currentFile);
                    done();
                    // this.dropzone.emit("thumbnail", file, URL.createObjectURL(file));
                    // this.emit("removedfile", file);
                    // this.currentFile.previewElement.parentNode.removeChild(this.currentFile.previewElement);
                    (<HTMLElement>file.previewElement.querySelector('.dz-thumbnail')).style.backgroundImage = 'url(' + URL.createObjectURL(file) + ')';
                    this.currentFile = file;
                }
                else {
                    ImageEditor.resize(file).then((result: any) => {
                        // file = result.file;
                        // console.log('previewElement', file.previewElement);
                        this.dropzone.removeFile(file);
                        result.name = file.name;
                        this.dropzone.addFile(result.file);
                        // done();
                        // (<HTMLElement>result.file.previewElement.querySelector('.dz-thumbnail')).style.backgroundImage = 'url(' + result.dataURL + ')';
                    });
                    this.selectedVersion = { id: 0, dropzone: null };
                }
            },
            // headers: {
            //     aaa_action: 'taxCertFL',
            //     // aaa_filename: rec.getValue('companyname')
            // },

            // previewTemplate: document.querySelector('#template-container').innerHTML,
            // Specifing an event as an configuration option overwrites the default
            // `addedfile` event handler.
            // addedfile: function (file) {
            //     console.log(file);
            //     // file.previewElement = Dropzone.createElement(this.options.previewTemplate);
            //     // Now attach this new element some where in your page
            // },
        });

        // this.dropzone.createThumbnail = (file, callback) => {
        //     console.log('createThumbnail', file);
        //     var done = (<any>file).done;
        //     if (file['resizeComplete']) {
        //         done();
        //         this.dropzone.emit("thumbnail", file, URL.createObjectURL(file));
        //         this.currentFile = file;
        //         callback();
        //         // (<HTMLElement>file.previewElement.querySelector('.dz-thumbnail')).style.backgroundImage = 'url(' + URL.createObjectURL(file) + ')';
        //     }
        //     else {
        //         ImageEditor.resize(file).then((result: any) => {
        //             // file = result.file;
        //             this.dropzone.removeFile(file);
        //             this.dropzone.addFile(result.file);
        //             // done();
        //             // (<HTMLElement>file.previewElement.querySelector('.dz-thumbnail')).style.backgroundImage = 'url(' + result.dataURL + ')';
        //         });
        //         this.selectedVersion = { id: 0, dropzone: null };
        //     }
        // };

        var date = new Date();
        // this.awsFileKey = date.getFullYear().toString() + '/' + (date.getMonth() + 1).toString() + '/' + this.transaction.record.id + '/' + this.version.lineDetail + '-' + this.version.graphic + '-' + this.version.id;
        this.awsFileKey = date.getFullYear().toString() + '/' + (date.getMonth() + 1).toString() + '/' + this.transaction.record.id + '/' + this.version.lineDetail + '-' + this.version.id;
        this.dropzone.on("addedfile", (file: File) => {
            console.log('addedfile', file);
        });
        this.dropzone.on("removedfile", (file: File) => {
            console.log('removedfile', file);
        });
        this.dropzone.on("dragover", (file: File) => {
            // console.log('dragover')  This keeps repeating as the object is being dragged!
            this.dropzoneElement.classList.add('dropzone-hover');
        });
        this.dropzone.on("dragleave", (file: File) => {
            this.dropzoneElement.classList.remove('dropzone-hover');
        });
        this.dropzone.on("dragend", (file: File) => {
            this.dropzoneElement.classList.remove('dropzone-hover');
        });
        this.dropzone.on("processing", (file: DropzoneFile) => {
            console.log('processing', file);
            (<HTMLElement>file.previewElement.querySelector('.dz-thumbnail')).style.backgroundImage = 'url(' + URL.createObjectURL(file) + ')';
        });
        // this.dropzone.on("thumbnail", (file: File, dataUrl: string) => {
        //     console.log('thumbnail', file, dataUrl);
        // });
        this.dropzone.on("sending", (file: File, xhr, formData: FormData) => {
            var dotIndex = (file.name) ? file.name.lastIndexOf('.') : -1;
            this.awsFileExt = (dotIndex > -1) ? file.name.substr(dotIndex) : '.jpg';
            formData.append('key', this.awsFileKey + this.awsFileExt);
        });
        this.dropzone.on("success", (file: DropzoneFile, responseText) => {
            this.netsuite.setLabelImage(this.version.id, this.awsFileKey + this.awsFileExt, file.width, file.height, file.size)
                .then((result) => console.log('Label Image path set', this.version.id, result));
        });

        if (this.version.labelImage) {
            var filepath = this.version.labelImage.split('/');
            var mockFile = <DropzoneFile>{ name: filepath[filepath.length - 1] }; //, size: 12345

            // Call the default addedfile event handler
            this.dropzone.emit("addedfile", mockFile);
            console.log('mockFile', mockFile);
            // console.log('this.dropzone.files[0]', this.dropzone.files[0]);
            // And optionally show the thumbnail of the file:
            // this.dropzone.emit("thumbnail", mockFile, this.appState.labelImagesRootUrl + this.version.labelImage);
            (<HTMLElement>mockFile.previewElement.querySelector('.dz-thumbnail')).style.backgroundImage = 'url(' + this.appState.labelImagesRootUrl + this.version.labelImage + ')';
            // Or if the file on your server is not yet in the right
            // size, you can let Dropzone download and resize it
            // callback and crossOrigin are optional.
            // this.dropzone.createThumbnailFromUrl(this.dropzone.files[0], this.appState.labelImagesRootUrl + this.version.labelImage);

            // Make sure that there is no progress bar, etc...
            this.dropzone.emit("complete", mockFile);
            this.currentFile = mockFile;

            // If you use the maxFiles option, make sure you adjust it to the
            // correct amount:
            // this.dropzone.options.maxFiles = 0;
        }
    }

    selectDropzone() {
        // this.canvasElement = this.versionCanvasElement;
        if (this.selectedVersion.id == this.version.id) this.selectedVersion = { id: 0, dropzone: null };
        else this.selectedVersion = { id: this.version.id, dropzone: this.dropzone };
        // window.addEventListener("paste", this.handlePasteImage.bind(this)); //chrome only?
    }

}