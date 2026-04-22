(function () {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('wg-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    function observe() {
        document.querySelectorAll('._widget_data.wg_animated, ._widget_data .wg_animated').forEach(function (el) {
            if (!el.classList.contains('wg-revealed')) {
                observer.observe(el);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observe);
    } else {
        observe();
    }
})();
