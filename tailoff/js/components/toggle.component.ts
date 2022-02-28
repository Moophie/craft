import { DOMHelper } from '../utils/domHelper';
import { ScrollHelper } from '../utils/scroll';

export class ToggleComponent {
  private animationSpeed = 400;
  private scrollSpeed = 400;

  constructor() {
    const triggers = document.querySelectorAll('[data-s-toggle]');
    Array.from(triggers).forEach((t: HTMLElement) => {
      this.initToggleTrigger(t);
    });

    DOMHelper.onDynamicContent(document.documentElement, '[data-s-toggle]', (triggers) => {
      Array.from(triggers).forEach((t: HTMLElement) => {
        if (!t.classList.contains('toggle-initialized')) {
          this.initToggleTrigger(t);
        }
      });
    });
  }

  private initToggleTrigger(el: HTMLElement) {
    const target = el.getAttribute('data-s-toggle');
    const animation = el.getAttribute('data-s-toggle-animation');
    const changeClass = el.getAttribute('data-s-toggle-class') ?? 'hidden';
    const defaultExpanded = el.getAttribute('data-s-toggle-default-expanded');
    const height = parseInt(el.getAttribute('data-s-toggle-height'));
    const margin = parseInt(el.getAttribute('data-s-toggle-margin')) ?? 0;
    const group = el.getAttribute('data-s-toggle-group');

    if (defaultExpanded) {
      el.setAttribute('aria-expanded', 'true');
    } else {
      el.setAttribute('aria-expanded', 'false');
    }

    if (height) {
      const targetElement = document.querySelector(`${target}`) as HTMLElement;
      if (targetElement.scrollHeight > height + (height * margin) / 100) {
        targetElement.style.maxHeight = `${height}px`;
      } else {
        el.parentElement.removeChild(el);
        targetElement.classList.remove(changeClass);
      }
    }

    el.setAttribute('aria-controls', target);
    el.setAttribute('tabindex', '0');
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (group) {
        const groupElement = document.querySelector(`${group}`) as HTMLElement;
        const activeEl = groupElement.querySelector('[data-s-toggle][aria-expanded="true"]');
        if (activeEl && activeEl !== el) {
          const activeTarget = activeEl.getAttribute('data-s-toggle');
          this.toggleAction(activeEl, activeTarget, changeClass, animation);
        }
      }
      this.toggleAction(el, target, changeClass, animation);
    });

    el.addEventListener('open', () => {
      this.toggleAction(el, target, changeClass, animation);
    });
  }

  private toggleAction(el, target, changeClass, animation) {
    const expanded = el.getAttribute('aria-expanded') === 'true';
    const linkedButtons = document.querySelectorAll(`[data-s-toggle='${target}']`);
    Array.from(linkedButtons).forEach((b) => {
      this.switchButtonState(b);
    });

    if (el.getAttribute('data-s-toggle-scroll')) {
      const scrollToElement = document.querySelector(`${el.getAttribute('data-s-toggle-scroll')}`) as HTMLElement;
      if (scrollToElement) {
        ScrollHelper.scrollToY(scrollToElement, this.scrollSpeed);
      }
    }

    const targetElement = document.querySelector(`${target}`) as HTMLElement;
    if (targetElement.classList.contains(changeClass)) {
      if (animation) {
        this.hideAnimated(targetElement, changeClass, animation);
      } else {
        targetElement.classList.remove(changeClass);
      }
    } else {
      if (animation) {
        this.showAnimated(targetElement, changeClass, animation);
      } else {
        targetElement.style.maxHeight = '';
        targetElement.classList.add(changeClass);
      }
      if (el.hasAttribute('data-s-toggle-height')) {
        el.parentElement.removeChild(el);
      }
    }
  }

  private switchButtonState(button) {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  }

  private showAnimated(el, changeClass, animation) {
    let speed = this.animationSpeed;
    if (parseInt(animation)) {
      speed = parseInt(animation);
      el.style.transitionDuration = `${speed}ms`;
    }
    const height = this.getHeight(el); // Get the natural height
    el.classList.add(changeClass); // Make the element visible
    el.style.maxHeight = height; // Update the max-height

    // Once the transition is complete, remove the inline max-height so the content can scale responsively
    window.setTimeout(function () {
      el.style.maxHeight = '';
    }, speed);
  }

  // Hide an element
  private hideAnimated(el, changeClass, animation) {
    let speed = this.animationSpeed;
    if (parseInt(animation)) {
      speed = parseInt(animation);
      el.style.transitionDuration = `${speed}ms`;
    }
    // Give the element a height to change from
    el.style.maxHeight = el.scrollHeight + 'px';

    // Set the height back to 0
    window.setTimeout(function () {
      el.style.maxHeight = '0';
    }, 1);

    // When the transition is complete, hide it
    window.setTimeout(function () {
      el.classList.remove(changeClass);
    }, speed);
  }

  private getHeight(el) {
    el.style.display = 'block'; // Make it visible
    var height = el.scrollHeight + 'px'; // Get it's height
    el.style.display = ''; //  Hide it again
    return height;
  }
}
