import { preloadImages } from '../utils.js';

// Grid
const introGrid = document.querySelector('.intro-grid--images');

// The grid images
const gridImages = [...introGrid.querySelectorAll('.intro-grid__img')];

// The grid labels
const gridLabels = [...document.querySelectorAll('.intro-grid--labels > .intro-grid__label > .oh__inner')];

// The grid title
const gridTitle = {
    main: document.querySelector('.intro-title > .intro-title__main > .oh__inner'),
    sub: document.querySelector('.intro-title > .intro-title__sub > .oh__inner'),
};

// The slider title
const sliderTitle = {
    el: document.querySelector('.slider-title'),
    main: document.querySelector('.slider-title > .slider-title__main > .oh__inner'),
    desc: document.querySelector('.slider-title > .slider-title__desc'),
};

// Controls element
const controls = document.querySelector('.controls');
// Controls close button and nav elements
const closeCtrl = controls.querySelector('button.close');
const nav = controls.querySelector('nav.nav');

// Clicked image's index value
let current = -1;
// Check if the animation is in progress
let isAnimating = false;
// grid || slider
let mode = 'grid';

// Show the slider
const showSlider = image => {
    if ( isAnimating || mode === 'slider' ) return;
    isAnimating = true;
    mode = 'slider';

    const DURATION = 1;
    const EASE = 'power4.inOut';

    current = gridImages.indexOf(image);

    gsap
    .timeline({
        defaults: {
            duration: DURATION,
            ease: EASE
        },
        onComplete: () => isAnimating = false
    })
    .addLabel('start', 0)
    .to(Object.values(gridTitle), {
        yPercent: -100
    }, 'start')
    .to(gridLabels, {
        yPercent: -100
    }, 'start')
    .to(image, {filter: 'brightness(100%) hue-rotate(0deg)'}, 'start')
    .add(() => {
        // Save current state  of all images
        const flipstate = Flip.getState(gridImages);
        // Change layout
        introGrid.classList.add('intro-grid--slider');
        // and position the introSlider at the center of the current image
        gsap.set(introGrid, {
            yPercent: -100*current
        });
        // Animate all
        Flip.from(flipstate, {
            duration: DURATION,
            ease: EASE,
            absolute: true,
            stagger: {
                each: 0.02,
                from: current
            },
            simple: true,
            prune: true,
        });
    }, 'start')
    .set(sliderTitle.el, {
        opacity: 1
    }, 'start')
    .fromTo([sliderTitle.main, sliderTitle.desc], {
        yPercent: pos => pos ? 240 : 100,
        opacity: pos => pos ? 0 : 1
    }, {
        yPercent: 0,
        opacity: 1
    }, 'start')
    .add(() => {
        controls.classList.add('controls--open');
    }, 'start')
    .fromTo([closeCtrl, nav], {
        scale: 0
    }, {
        opacity: 1,
        scale: 1,
        stagger: 0.02
    }, 'start')
};

// Hide the slider
const hideSlider = () => {
    if ( isAnimating || mode === 'grid' ) return;
    isAnimating = true;
    mode = 'grid';

    const DURATION = 1;
    const EASE = 'power4.inOut';

    gsap
    .timeline({
        defaults: {
            duration: DURATION,
            ease: EASE
        },
        onComplete: () => isAnimating = false
    })
    .to([closeCtrl, nav], {
        opacity: 0,
        scale: 0
    }, 'start')
    .add(() => {
        controls.classList.remove('controls--open');
    }, 'start')
    .to([sliderTitle.main, sliderTitle.desc], {
        yPercent: pos => pos ? 150 : 100,
        opacity: pos => pos ? 0 : 1,
        onComplete: () => gsap.set(sliderTitle.el, {opacity: 0})
    }, 'start')
    .add(() => {
        // Save current state  of all images
        const flipstate = Flip.getState(gridImages, {props: 'filter'});
        // Change layout
        introGrid.classList.remove('intro-grid--slider');
        gsap.set(gridImages[current], {filter: 'brightness(100%) hue-rotate(0deg)'});
        gsap.set(introGrid, {
            yPercent: 0
        });
        // Animate all
        Flip.from(flipstate, {
            duration: DURATION,
            ease: EASE,
            absolute: true,
            stagger: {
                each: 0.02,
                from: current
            },
            simple: true,
            prune: true,
        });
    }, 'start')
    .to([gridLabels, Object.values(gridTitle)], {
        yPercent: 0
    }, 'start')
};

// Grid images click event
gridImages.forEach(image => {
    image.addEventListener('click', () => showSlider(image));

    image.addEventListener('mouseenter', () => {
        if ( mode === 'slider' ) return;
        gsap.fromTo(image, {
            filter: 'brightness(100%) hue-rotate(0deg)'
        }, {
            duration: 1, 
            ease: 'power4', 
            filter: 'brightness(200%) hue-rotate(130deg)'
        });
    });

    image.addEventListener('mouseleave', () => {
        if ( mode === 'slider' ) return;
        gsap.to(image, {
            duration: 1, 
            ease: 'power4', 
            filter: 'brightness(100%) hue-rotate(0deg)'
        });
    });

    closeCtrl.addEventListener('click', () => hideSlider());
});

// Preload images then remove loader (loading class) from body
preloadImages('.intro-grid__img').then(() => document.body.classList.remove('loading'));