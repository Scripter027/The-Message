(function() {
    const windowExplorer = document.getElementById('windowExplorer');
    const btnCloseExplorer = document.getElementById('btnCloseExplorer');
    const explorerContainer = document.getElementById('explorerContainer');

    window.initExplorerApp = function() {
        windowExplorer.classList.remove('hidden');
        window.renderExplorerContents();
    };

    btnCloseExplorer.addEventListener('click', () => {
        windowExplorer.classList.add('hidden');
    });

    window.renderExplorerContents = function() {
        explorerContainer.innerHTML = '';
        const lang = document.documentElement.lang || 'ru';
        
        const activeApps = window.AppConfig.state.installed.filter(appId => {
            return !window.AppConfig.state.trashContents.includes(appId);
        });

        if (activeApps.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.style.color = '#00ff66';
            emptyEl.style.opacity = '0.5';
            emptyEl.style.padding = '10px';
            emptyEl.textContent = lang === 'ru' ? 'Папка пуста' : 'Folder is empty';
            explorerContainer.appendChild(emptyEl);
            return;
        }

        activeApps.forEach(appId => {
            const appData = window.AppConfig.allApps[appId];
            if (!appData) return;

            const itemEl = document.createElement('div');
            itemEl.style.display = 'flex';
            itemEl.style.justifyContent = 'space-between';
            itemEl.style.alignItems = 'center';
            itemEl.style.padding = '10px';
            itemEl.style.borderBottom = '1px solid rgba(0, 255, 102, 0.2)';

            const infoEl = document.createElement('div');
            infoEl.style.display = 'flex';
            infoEl.style.gap = '15px';
            infoEl.style.color = '#00ff66';
            infoEl.style.cursor = 'pointer';
            infoEl.style.flex = '1';

            const iconEl = document.createElement('span');
            iconEl.textContent = appData.icon;

            const nameEl = document.createElement('span');
            nameEl.textContent = lang === 'ru' ? appData.nameRu : appData.nameEn;

            infoEl.appendChild(iconEl);
            infoEl.appendChild(nameEl);

            infoEl.addEventListener('click', () => {
                if (window.openApplicationWindow) {
                    window.openApplicationWindow(appId);
                }
            });

            itemEl.appendChild(infoEl);

            if (appData.type !== 'system') {
                const deleteBtn = document.createElement('button');
                deleteBtn.style.background = 'transparent';
                deleteBtn.style.border = '1px solid #ff3333';
                deleteBtn.style.color = '#ff3333';
                deleteBtn.style.padding = '5px 10px';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.fontFamily = 'Russo One, sans-serif';
                deleteBtn.style.fontSize = '0.8rem';
                deleteBtn.textContent = lang === 'ru' ? 'Удалить' : 'Delete';

                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (window.moveAppToTrash) {
                        window.moveAppToTrash(appId);
                    }
                });

                itemEl.appendChild(deleteBtn);
            }

            explorerContainer.appendChild(itemEl);
        });
    };
})();
