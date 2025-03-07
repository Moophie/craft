import { DOMHelper } from '../utils/domHelper';
import { ScrollHelper } from '../utils/scroll';

export class ToggleComponent {
  private animationSpeed = 400;
  private scrollSpeed = 400;

  constructor() {
    const targets = document.querySelectorAll('[data-s-toggle]');
    Array.from(targets).forEach((t: HTMLElement) => {
      this.initToggleTarget(t);
    });

    DOMHelper.onDynamicContent(document.documentElement, '[data-s-toggle]', (targets) => {
      Array.from(targets).forEach((t: HTMLElement) => {
        if (!t.classList.contains('toggle-initialized')) {
          this.initToggleTarget(t);
        }
      });
    });
  }

  private initToggleTarget(target: HTMLElement) {
    const triggers = document.querySelectorAll(`[data-s-toggle-target="${target.id}"]`);
    const height = parseInt(target.getAttribute('data-s-toggle-height'));
    const margin = parseInt(target.getAttribute('data-s-toggle-margin')) ?? 0;
    
    if (height) {
      if (target.scrollHeight > height + (height * margin) / 100) {
        target.style.maxHeight = `${height}px`;
      } else {
        Array.from(triggers).forEach((trigger: HTMLElement) => {
          trigger.parentElement.removeChild(trigger);
        })
      }
    }

    Array.from(triggers).forEach((trigger: HTMLElement) => {
      this.initToggleTrigger(trigger, target);
    })
  }

  private initToggleTrigger(trigger: HTMLElement, target) {
    const animation = target.getAttribute('data-s-toggle-animation');
    const changeClass = target.getAttribute('data-s-toggle-class') ?? 'hidden';
    const defaultExpanded = target.getAttribute('data-s-toggle-default-expanded');
    const group = target.getAttribute('data-s-toggle-group');

    if (defaultExpanded) {
      trigger.setAttribute('aria-expanded', 'true');
    } else {
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.setAttribute('aria-controls', target.id);
    trigger.setAttribute('tabindex', '0');
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (group) {
        const groupElement = document.querySelector(`#${group}`) as HTMLElement;
        const activeEl = groupElement.querySelector('[data-s-toggle-target][aria-expanded="true"]');
        if (activeEl && activeEl !== trigger) {
          const activeTarget = document.querySelector(`#${activeEl.getAttribute('data-s-toggle-target')}`);
          this.toggleAction(activeEl, activeTarget, changeClass, animation);
        }
      }
      this.toggleAction(trigger, target, changeClass, animation);
    });

    trigger.addEventListener('open', () => {
      this.toggleAction(trigger, target, changeClass, animation);
    });
  }

  private toggleAction(trigger, target, changeClass, animation) {
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    const linkedButtons = document.querySelectorAll(`[data-s-toggle-target='${target.id}']`);
    Array.from(linkedButtons).forEach((b) => {
      this.switchButtonState(b);
    });

    if (trigger.getAttribute('data-s-toggle-scroll')) {
      const scrollToElement = document.querySelector(`${trigger.getAttribute('data-s-toggle-scroll')}`) as HTMLElement;
      if (scrollToElement) {
        ScrollHelper.scrollToY(scrollToElement, this.scrollSpeed);
      }
    }

    if (expanded) {
      if (animation) {
        this.hideAnimated(target, changeClass, animation);
      } else {
        target.classList.add(changeClass);
      }
    } else {
      if (target.hasAttribute('data-s-toggle-height')) {
        trigger.parentElement.removeChild(trigger);
      }
      if (animation) {
        this.showAnimated(target, changeClass, animation);
      } else {
        target.style.maxHeight = 'none';
        target.classList.remove(changeClass);
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
    el.classList.remove(changeClass); // Make the element visible
    el.style.maxHeight = height; // Update the max-height

    // Once the transition is complete, remove the inline max-height so the content can scale responsively
    window.setTimeout(function () {
      el.style.maxHeight = 'none';
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
      el.classList.add(changeClass);
    }, speed);
  }

  private getHeight(el) {
    el.style.display = 'block'; // Make it visible
    var height = el.scrollHeight + 'px'; // Get it's height
    el.style.display = ''; //  Hide it again
    return height;
  }
}
