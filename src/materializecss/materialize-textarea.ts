import { customElement, bindable, inject } from 'aurelia-framework';

export class MaterializeTextareaCustomElement {
    @bindable valueText;
    @bindable label;
    @bindable textareaRef: any;
    @bindable style;

    elementId;
    // textareaAutoResize;
    hiddenDiv;

    constructor() {
        this.elementId = Math.floor(Math.random() * 99999999);
    }

    // valueTextChanged() {
    //     // var $textarea = $(this.textareaRef).first();
    //     // console.debug('value changed', $textarea);
    //     setTimeout(function () {
    //         $(this.textareaRef).trigger('autoresize');
    //     }, 0);
    //     // $('.materialize-textarea-custom').each(function () {
    //     //     var $textarea = $(this);
    //     //     // var textareaAutoResize = this.textareaAutoResize;
    //     //     if ($textarea.val().length) {
    //     //         setTimeout(function () {
    //     //             textareaAutoResize($textarea)
    //     //         }, 0);
    //     //     }
    //     // });
    //     // if ($textarea.val().length) {
    //     // this.textareaAutoResize($textarea);
    //     // }
    // }

    attached() {
        // Textarea Auto Resize
        this.hiddenDiv = $('#materialize-hiddendiv');//$('.hiddendiv').first();
        if (!this.hiddenDiv.length) {
            this.hiddenDiv = $('<div id="materialize-hiddendiv" class="hide-offscreen common" style="white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;padding-top: 1.2rem;"></div>');
            $('body').append(this.hiddenDiv);

            var text_area_selector = '.materialize-textarea-custom';

            // function textareaAutoResize($textarea) {
            //     // Set font properties of hiddenDiv

            //     var fontFamily = $textarea.css('font-family');
            //     var fontSize = $textarea.css('font-size');
            //     var fontWeight = $textarea.css('font-weight');
            //     var padding = $textarea.css('padding');
            //     var lineHeight = $textarea.css('line-height');

            //     if (fontSize) { hiddenDiv.css('font-size', fontSize); }
            //     if (fontWeight) { hiddenDiv.css('font-weight', fontWeight); }
            //     if (fontFamily) { hiddenDiv.css('font-family', fontFamily); }
            //     if (padding) { hiddenDiv.css('padding', padding); }
            //     if (lineHeight) { hiddenDiv.css('line-height', lineHeight); }

            //     if ($textarea.attr('wrap') === "off") {
            //         hiddenDiv.css('overflow-wrap', "normal")
            //             .css('white-space', "pre");
            //     }

            //     hiddenDiv.text($textarea.val() + '\n');
            //     var content = hiddenDiv.html().replace(/\n/g, '<br>');
            //     hiddenDiv.html(content);

            //     // When textarea is hidden, width goes crazy.
            //     // Approximate with half of window size

            //     if ($textarea.is(':visible')) {
            //         // hiddenDiv.css('width', $textarea.width());
            //         hiddenDiv.innerWidth($textarea.innerWidth());
            //     }
            //     else {
            //         hiddenDiv.css('width', $(window).width() / 2);
            //     }

            //     // $textarea.css('height', hiddenDiv.outerHeight());
            //     $textarea.innerHeight(hiddenDiv.innerHeight());
            // }

            var textareaAutoResize = this.textareaAutoResize;

            $(text_area_selector).each(function () {
                var $textarea = $(this);
                if ($textarea.val().length) {
                    textareaAutoResize($textarea);
                }
            });

            $('body').on('keydown keyup autoresize', text_area_selector, function () {
                textareaAutoResize($(this));
            });
        }
        else if (this.valueText) {
            $(this.textareaRef).trigger('autoresize');
        }
    }

    textareaAutoResize($textarea) {
        // Set font properties of hiddenDiv
        var hiddenDiv = $('#materialize-hiddendiv'); //this.hiddenDiv;

        var fontFamily = $textarea.css('font-family');
        var fontSize = $textarea.css('font-size');
        var fontWeight = $textarea.css('font-weight');
        var padding = $textarea.css('padding');
        var lineHeight = $textarea.css('line-height');

        if (fontSize) { hiddenDiv.css('font-size', fontSize); }
        if (fontWeight) { hiddenDiv.css('font-weight', fontWeight); }
        if (fontFamily) { hiddenDiv.css('font-family', fontFamily); }
        if (padding) { hiddenDiv.css('padding', padding); }
        if (lineHeight) { hiddenDiv.css('line-height', lineHeight); }

        if ($textarea.attr('wrap') === "off") {
            hiddenDiv.css('overflow-wrap', "normal")
                .css('white-space', "pre");
        }

        hiddenDiv.text($textarea.val() + '\n');
        var content = hiddenDiv.html().replace(/\n/g, '<br>');
        hiddenDiv.html(content);
        if (content && !$textarea.prev().hasClass('active')) {
            $textarea.prev().addClass('active')
        }
        // When textarea is hidden, width goes crazy.
        // Approximate with half of window size

        if ($textarea.is(':visible')) {
            // hiddenDiv.css('width', $textarea.width());
            hiddenDiv.innerWidth($textarea.innerWidth());
        }
        else {
            hiddenDiv.css('width', $(window).width() / 2);
        }

        // $textarea.css('height', hiddenDiv.outerHeight());
        $textarea.innerHeight(hiddenDiv.innerHeight());
    }
}