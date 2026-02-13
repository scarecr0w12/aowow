export class UIController {
  constructor(container, viewer) {
    this.container = container;
    this.viewer = viewer;
    this.elements = {};
  }

  render(options) {
    this.container.innerHTML = '';

    const section = (title) => {
      const div = document.createElement('div');
      div.style.cssText = `
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #444;
      `;

      const h3 = document.createElement('h3');
      h3.textContent = title;
      h3.style.cssText = `
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 1px;
      `;
      div.appendChild(h3);

      return div;
    };

    const label = (text) => {
      const l = document.createElement('label');
      l.textContent = text;
      l.style.cssText = `
        display: block;
        font-size: 12px;
        margin-bottom: 5px;
        color: #ccc;
      `;
      return l;
    };

    const select = (id, options, onChange) => {
      const sel = document.createElement('select');
      sel.id = id;
      sel.style.cssText = `
        width: 100%;
        padding: 6px;
        background: #333;
        color: #fff;
        border: 1px solid #555;
        border-radius: 3px;
        font-size: 12px;
        margin-bottom: 10px;
        cursor: pointer;
      `;

      options.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        sel.appendChild(option);
      });

      sel.addEventListener('change', onChange);
      this.elements[id] = sel;
      return sel;
    };

    const button = (text, onClick) => {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.style.cssText = `
        width: 100%;
        padding: 8px;
        background: #0066cc;
        color: #fff;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
        margin-bottom: 8px;
        transition: background 0.2s;
      `;
      btn.onmouseover = () => (btn.style.background = '#0052a3');
      btn.onmouseout = () => (btn.style.background = '#0066cc');
      btn.onclick = onClick;
      return btn;
    };

    if (options.type === 16) {
      const raceSection = section('Character');

      const races = [
        { value: 1, text: 'Human' },
        { value: 2, text: 'Orc' },
        { value: 3, text: 'Dwarf' },
        { value: 4, text: 'Night Elf' },
        { value: 5, text: 'Undead' },
        { value: 6, text: 'Tauren' },
        { value: 7, text: 'Gnome' },
        { value: 8, text: 'Troll' },
        { value: 10, text: 'Blood Elf' },
        { value: 11, text: 'Draenei' }
      ];

      raceSection.appendChild(label('Race'));
      raceSection.appendChild(
        select('race-select', races, (e) => {
          this.viewer.setRace(parseInt(e.target.value));
        })
      );

      const sexes = [
        { value: 0, text: 'Male' },
        { value: 1, text: 'Female' }
      ];

      raceSection.appendChild(label('Sex'));
      raceSection.appendChild(
        select('sex-select', sexes, (e) => {
          this.viewer.setSex(parseInt(e.target.value));
        })
      );

      this.container.appendChild(raceSection);
    }

    const animSection = section('Animation');
    animSection.appendChild(label('Play Animation'));

    this.elements.animationSelect = select('animation-select', [{ value: '', text: 'Loading...' }], (e) => {
      if (e.target.value) {
        this.viewer.setAnimation(e.target.value);
      }
    });

    animSection.appendChild(this.elements.animationSelect);
    animSection.appendChild(
      button('Stop', () => {
        this.viewer.animationController?.stopAnimation();
      })
    );

    this.container.appendChild(animSection);

    const viewSection = section('View');
    viewSection.appendChild(
      button('Reset Camera', () => {
        this.viewer.cameraController?.reset();
      })
    );

    viewSection.appendChild(
      button('Fullscreen', () => {
        const elem = this.viewer.viewportContainer;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        }
      })
    );

    this.container.appendChild(viewSection);

    this.elements.errorMessage = document.createElement('div');
    this.elements.errorMessage.style.cssText = `
      background: #cc3333;
      color: #fff;
      padding: 10px;
      border-radius: 3px;
      font-size: 12px;
      margin-top: 10px;
      display: none;
    `;
    this.container.appendChild(this.elements.errorMessage);
  }

  updateAnimations(animations) {
    if (!this.elements.animationSelect) return;

    const options = [{ value: '', text: 'None' }];
    animations.forEach((anim) => {
      options.push({
        value: anim.name,
        text: `${anim.name} (${anim.duration.toFixed(1)}s)`
      });
    });

    this.elements.animationSelect.innerHTML = '';
    options.forEach((opt) => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      this.elements.animationSelect.appendChild(option);
    });
  }

  showError(message) {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message;
      this.elements.errorMessage.style.display = 'block';
      setTimeout(() => {
        this.elements.errorMessage.style.display = 'none';
      }, 5000);
    }
  }
}
