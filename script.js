(function() {
            const C = 299792458; 
            const PROPER_TAU = 2.2; 

            let trialCount = 0;
            let isSimulating = false;
            let currentAnimationId = null;

            function init() {
                const slider = document.getElementById('v-slider');
                const vDisplay = document.getElementById('v-display');
                const msDisplay = document.getElementById('ms-display');
                const fireBtn = document.getElementById('fire-btn');
                const simView = document.getElementById('sim-view');
                const liveTimer = document.getElementById('live-timer');
                const dataLog = document.getElementById('data-log');
                const emptyMsg = document.getElementById('empty-msg');
                const clearBtn = document.getElementById('clear-table');

                function getGamma(v_c) {
                    // Safety check for v_c >= 1
                    if (v_c >= 1) v_c = 0.9999;
                    const diff = 1 - (v_c * v_c);
                    // Return a very large number if diff is effectively 0, else calculated gamma
                    return diff <= 0.0000001 ? 100 : 1 / Math.sqrt(diff);
                }

                function updateUI() {
                    const v = parseFloat(slider.value);
                    const gamma = getGamma(v);
                    vDisplay.textContent = v.toFixed(3);
                    gammaDisplay.textContent = gamma.toFixed(2);
                    msDisplay.textContent = (v * C).toExponential(2) + " m/s";
                }

                function addTrial(v, gamma, dt) {
                    trialCount++;
                    emptyMsg.style.display = 'none';
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-slate-800/30';
                    row.innerHTML = `
                        <td class="p-4 font-mono text-slate-500">${trialCount}</td>
                        <td class="p-4 font-mono text-slate-300">${v.toFixed(3)}</td>
                        <td class="p-4 font-mono text-sky-400 font-bold">${gamma.toFixed(2)}</td>
                        <td class="p-4 font-mono text-emerald-400 font-bold">${dt.toFixed(3)}</td>
                    `;
                    dataLog.prepend(row);
                }

                function fire() {
                    if (isSimulating) return;
                    isSimulating = true;
                    fireBtn.disabled = true;
                    fireBtn.style.opacity = '0.5';

                    const v_c = parseFloat(slider.value);
                    const gamma = getGamma(v_c);
                    
                    // FIXED: Removed randomness. Now strictly calculates theoretical mean.
                    // dt = gamma * proper_time
                    const dilatedTime = gamma * PROPER_TAU;

                    const muon = document.createElement('div');
                    muon.className = 'muon-particle';
                    muon.style.left = (30 + Math.random() * 40) + '%';
                    muon.style.top = '0px';
                    simView.appendChild(muon);

                    let start = null;
                    const duration = 2000; // Animation visual duration in ms

                    function animate(time) {
                        if (!start) start = time;
                        const elapsed = time - start;
                        const progress = Math.min(elapsed / duration, 1);

                        muon.style.top = (progress * (simView.offsetHeight - 20)) + 'px';
                        liveTimer.textContent = (progress * dilatedTime).toFixed(2);

                        if (progress < 1) {
                            currentAnimationId = requestAnimationFrame(animate);
                        } else {
                            const flash = document.createElement('div');
                            flash.className = 'decay-flash';
                            flash.style.left = muon.style.left;
                            flash.style.top = muon.style.top;
                            simView.appendChild(flash);
                            muon.remove();
                            setTimeout(() => { if(flash.parentNode) flash.remove(); }, 400);
                            addTrial(v_c, gamma, dilatedTime);
                            isSimulating = false;
                            fireBtn.disabled = false;
                            fireBtn.style.opacity = '1';
                        }
                    }
                    currentAnimationId = requestAnimationFrame(animate);
                }

                slider.oninput = updateUI;
                fireBtn.onclick = fire;
                clearBtn.onclick = () => {
                    dataLog.innerHTML = '';
                    emptyMsg.style.display = 'block';
                    trialCount = 0;
                    liveTimer.textContent = '0.00';
                    if (currentAnimationId) cancelAnimationFrame(currentAnimationId);
                    simView.querySelectorAll('.muon-particle, .decay-flash').forEach(e => e.remove());
                    isSimulating = false;
                    fireBtn.disabled = false;
                    fireBtn.style.opacity = '1';
                };
                updateUI();
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }
        })();
