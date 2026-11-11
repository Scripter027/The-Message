(function() {
    let ysdk = null;
    let player = null;
    let adTimerInterval = null;
    let secondsElapsed = 0;
    let isAdShowing = false;
    let isGameplayActive = false;

    window.YandexModule = {
        init: function() {
            if (typeof YaGames === 'undefined') {
                return Promise.resolve();
            }
            return YaGames.init().then(sdk => {
                ysdk = sdk;
                window.ysdk = sdk;

                const envLang = sdk.environment?.i18n?.lang;
                if (envLang && window.switchLanguage) {
                    const targetLang = envLang === 'ru' ? 'ru' : 'en';
                    window.switchLanguage(targetLang);
                }

                return sdk.getPlayer({ scopes: false }).then(p => {
                    player = p;
                }).catch(() => {});
            }).catch(() => {});
        },

        gameReady: function() {
            if (ysdk && ysdk.features && ysdk.features.LoadingAPI) {
                ysdk.features.LoadingAPI.ready();
            }
        },

        startGameplay: function() {
            isGameplayActive = true;
            if (ysdk && ysdk.features && ysdk.features.GameplayAPI) {
                ysdk.features.GameplayAPI.start();
            }
            this.startFiveMinuteTimer();
        },

        stopGameplay: function() {
            isGameplayActive = false;
            if (ysdk && ysdk.features && ysdk.features.GameplayAPI) {
                ysdk.features.GameplayAPI.stop();
            }
            this.stopFiveMinuteTimer();
        },

        startFiveMinuteTimer: function() {
            this.stopFiveMinuteTimer();
            secondsElapsed = 0;
            adTimerInterval = setInterval(() => {
                if (!isGameplayActive || isAdShowing || document.hidden) return;
                secondsElapsed++;
                if (secondsElapsed >= 300) {
                    secondsElapsed = 0;
                    this.showAdWithCountdown();
                }
            }, 1000);
        },

        stopFiveMinuteTimer: function() {
            if (adTimerInterval) {
                clearInterval(adTimerInterval);
                adTimerInterval = null;
            }
        },

        showAd: function(onCloseCallback) {
            if (!ysdk || !ysdk.adv || isAdShowing) {
                if (onCloseCallback) onCloseCallback();
                return;
            }

            isAdShowing = true;
            const wasPlaying = isGameplayActive;
            if (wasPlaying && ysdk.features && ysdk.features.GameplayAPI) {
                ysdk.features.GameplayAPI.stop();
            }

            ysdk.adv.showFullscreenAdv({
                callbacks: {
                    onClose: function() {
                        isAdShowing = false;
                        secondsElapsed = 0;
                        if (wasPlaying && ysdk.features && ysdk.features.GameplayAPI) {
                            ysdk.features.GameplayAPI.start();
                        }
                        if (onCloseCallback) onCloseCallback();
                    },
                    onError: function() {
                        isAdShowing = false;
                        if (wasPlaying && ysdk.features && ysdk.features.GameplayAPI) {
                            ysdk.features.GameplayAPI.start();
                        }
                        if (onCloseCallback) onCloseCallback();
                    }
                }
            });
        },

        showAdWithCountdown: function(onCloseCallback) {
            if (!ysdk || !ysdk.adv || isAdShowing) {
                if (onCloseCallback) onCloseCallback();
                return;
            }

            const oldBox = document.getElementById('yandexAdCountdown');
            if (oldBox) oldBox.remove();

            const lang = document.documentElement.lang || 'ru';
            let count = 3;

            const box = document.createElement('div');
            box.id = 'yandexAdCountdown';
            box.style.position = 'fixed';
            box.style.inset = '0';
            box.style.background = 'rgba(0, 0, 0, 0.88)';
            box.style.zIndex = '30000';
            box.style.display = 'flex';
            box.style.flexDirection = 'column';
            box.style.alignItems = 'center';
            box.style.justifyContent = 'center';
            box.style.color = '#00ff66';
            box.style.fontFamily = "'Russo One', sans-serif";
            box.style.textAlign = 'center';
            box.style.padding = '20px';

            const label = lang === 'ru' ? 'РЕКЛАМНАЯ ПАУЗА ЧЕРЕЗ:' : 'AD BREAK IN:';
            box.innerHTML = `
                <div style="font-size:1.3rem; letter-spacing:2px; margin-bottom:15px; text-shadow:0 0 10px #00ff66;">${label}</div>
                <div id="adCountNum" style="font-size:3.5rem; text-shadow:0 0 20px #00ff66;">3</div>
            `;
            document.body.appendChild(box);

            const numEl = document.getElementById('adCountNum');
            const timer = setInterval(() => {
                count--;
                if (count > 0) {
                    if (numEl) numEl.textContent = count;
                } else {
                    clearInterval(timer);
                    box.remove();
                    this.showAd(onCloseCallback);
                }
            }, 1000);
        },

        saveCloudData: function(dataObj) {
            if (player && player.setData) {
                player.setData(dataObj).catch(() => {});
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        window.YandexModule.init();
    });
})();
