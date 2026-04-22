(function () {
    var IMAGE_IDS = [
        'w202511281ae17a3939f44',
        'w20251128169fc87faf090',
        'w20251202fd7620aaf307e'
    ];

    function adjustHeights() {
        // Desktop only (≥992px)
        if (window.innerWidth < 992) return;

        IMAGE_IDS.forEach(function (id) {
            var widget = document.getElementById(id);
            if (!widget) return;

            var col6 = widget.closest('.col-dz-6');
            if (!col6) return;

            // Use the outer doz_row height (the flex row containing both text and image columns)
            var row = col6.parentElement;
            if (!row) return;

            var targetH = row.offsetHeight;
            if (targetH < 50) return;

            var imgBox = widget.querySelector('._img_box');
            var img = widget.querySelector('img');
            if (!imgBox || !img) return;

            imgBox.style.setProperty('height', targetH + 'px', 'important');
            imgBox.style.setProperty('overflow', 'hidden', 'important');
            img.style.setProperty('position', 'absolute', 'important');
            img.style.setProperty('top', '0', 'important');
            img.style.setProperty('left', '0', 'important');
            img.style.setProperty('right', '0', 'important');
            img.style.setProperty('bottom', '0', 'important');
            img.style.setProperty('width', '100%', 'important');
            img.style.setProperty('height', '100%', 'important');
            img.style.setProperty('object-fit', 'cover', 'important');
            img.style.setProperty('display', 'block', 'important');
            img.style.setProperty('margin', '0', 'important');
        });
    }

    // Run after IMAGE_RESIZE (which uses imagesLoaded + setTimeout 50ms)
    function runAfterImageResize() {
        setTimeout(adjustHeights, 200);
    }

    window.addEventListener('load', runAfterImageResize);

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(adjustHeights, 100);
    });
})();
