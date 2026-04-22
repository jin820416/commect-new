const SITE_ANIMATION = (() => {
	const revealAll = () => {
		document.querySelectorAll('._widget_data.wg_animated').forEach(el => {
			el.classList.add('wg-revealed');
		});
	};

	const run = () => {
		const sections = Array.from(document.querySelectorAll('div[doz_type="section"]'));
		if (sections.length === 0) { revealAll(); return; }

		if (!('IntersectionObserver' in window)) {
			revealAll();
			return;
		}

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (!entry.isIntersecting) return;

				// 이 섹션 안의 wg_animated 위젯들만 순서대로 애니메이션
				const widgets = Array.from(
					entry.target.querySelectorAll('._widget_data.wg_animated')
				).filter(el => el.getAttribute('data-animation-done') !== 'Y');

				widgets.forEach((el, i) => {
					setTimeout(() => {
						el.classList.add('wg-revealed');
						el.setAttribute('data-animation-done', 'Y');
					}, i * 120); // 위젯마다 120ms 간격으로 순차 실행
				});

				observer.unobserve(entry.target);
			});
		}, {
			threshold: 0.15  // 섹션의 15%가 화면에 들어왔을 때 트리거
		});

		sections.forEach(section => {
			const hasAnimated = section.querySelector('._widget_data.wg_animated');
			if (hasAnimated) observer.observe(section);
		});

		// 3초 후 fallback
		setTimeout(revealAll, 3000);
	};

	return {
		init: () => {
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', run);
			} else {
				run();
			}
		}
	};
})();
