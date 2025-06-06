// Main application object
const App = {
    config: {
        STORAGE_KEYS: { entries: 'workEntries_v5_final', settings: 'appSettings_v5_final' },
        persianMonths: ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'],
        defaultSettings: {
            standardStartTime: '07:00', standardEndTime: '15:00', dailyWorkHours: 8,
            maxOvertimeHours: 4, autoFillEndTime: true, periodStartMonth: 1, 
            periodYear: new Date().toLocaleDateString('fa-IR-u-nu-latn', {year:'numeric'}).split(' ')[0],
            holidays: ["1403/01/01","1403/01/02","1403/01/03","1403/01/04","1403/01/12","1403/01/13","1403/01/22","1403/02/01","1403/02/25","1403/03/14","1403/03/15","1403/04/05","1403/04/25","1403/04/26","1403/05/04","1403/06/17","1403/06/25","1403/07/02","1403/07/11","1403/07/22","1403/08/06","1403/11/22","1403/12/06","1403/12/29", "1404/01/01", "1404/01/02", "1404/01/03", "1404/01/04"]
        },
        debounceDelay: 300,
    },
    state: { workEntries: [], appSettings: {}, editingEntryId: null, filterMonth: 'all', sortOrder: 'desc', tempHolidays: [] },
    DOM: {},

    JalaliDate: { 
        toJalaali:function(g,e,t){if("[object Date]"===Object.prototype.toString.call(g)){t=g.getDate();e=g.getMonth()+1;g=g.getFullYear()}var r=[0,31,59,90,120,151,181,212,243,273,304,334],a=e>2?g+1:g,n=355666+365*g+~~((a+3)/4)-~~((a+99)/100)+~~((a+399)/400)+t+r[e-1];a=-1595+33*~~(n/12053);n%=12053;a+=4*~~(n/1461);n%=1461;if(n>365){a+=~~((n-1)/365);n=(n-1)%365}var i=n<186?1+~~(n/31):7+~~((n-186)/30);return{jy:a,jm:i,jd:1+(n<186?n%31:(n-186)%30)}},toGregorian:function(g,e,t){g+=1595;var r=-355668+365*g+~~(g/33)*8+~~(((g%33)+3)/4)+t+(e<7?(e-1)*31:(e-7)*30+186),a=400*~~(r/146097);r%=146097;if(r>36524){a+=100*~(--r/36524);r%=36524;r>=365&&r++}a+=4*~~(r/1461);r%=1461;if(r>365){a+=~~((r-1)/365);r=(r-1)%365}t=r+1;var n=[0,31,a%4==0&&a%100!=0||a%400==0?29:28,31,30,31,30,31,31,30,31,30,31];for(e=0;e<13&&t>n[e];e++)t-=n[e];return{gy:a,gm:e,gd:t}},formatJalaali:function(g,e,t,r="/"){return`${g}${r}${String(e).padStart(2,"0")}${r}${String(t).padStart(2,"0")}`},gregorianToJalaaliString:function(g){if(!g)return"";try{const[e,t,r]=g.split("-").map(Number);if(isNaN(e)||isNaN(t)||isNaN(r))return g;const{jy:a,jm:n,jd:i}=this.toJalaali(e,t,r);return this.formatJalaali(a,n,i)}catch(g){console.error("JalaliDate conversion error:", g); return g;}}
    },

    init: function() {
        this.DOM = { 
            notificationArea: document.getElementById('notificationArea'), dashboardPeriodDisplay: document.getElementById('dashboardPeriodDisplay'), dashboardStatsContainer: document.getElementById('dashboardStatsContainer'), recentEntriesContainer: document.getElementById('recentEntriesContainer'), recentEntriesCount: document.getElementById('recentEntriesCount'), entryFormTitle: document.getElementById('entryFormTitle'), editingEntryIdInput: document.getElementById('editingEntryId'), workDateInput: document.getElementById('workDate'), workDateShamsiDisplay: document.getElementById('workDateShamsiDisplay'), holidayIndicator: document.getElementById('holidayIndicator'), isDailyLeaveCheckbox: document.getElementById('isDailyLeave'), isManualHolidayCheckbox: document.getElementById('isManualHoliday'), timeInputsContainer: document.getElementById('timeInputsContainer'), startTimeInput: document.getElementById('startTime'), endTimeInput: document.getElementById('endTime'), breakTimeInput: document.getElementById('breakTime'), hourlyLeaveInput: document.getElementById('hourlyLeave'), workDescriptionInput: document.getElementById('workDescription'), saveWorkEntryBtn: document.getElementById('saveWorkEntryBtn'), clearEntryFormBtn: document.getElementById('clearEntryFormBtn'), workEntriesListContainer: document.getElementById('workEntriesListContainer'), totalEntriesCount: document.getElementById('totalEntriesCount'), entryFilterMonthSelect: document.getElementById('entryFilterMonth'), entrySortOrderSelect: document.getElementById('entrySortOrder'), reportFromDateInput: document.getElementById('reportFromDate'), reportToDateInput: document.getElementById('reportToDate'), reportFromDateShamsiDisplay: document.getElementById('reportFromDateShamsiDisplay'), reportToDateShamsiDisplay: document.getElementById('reportToDateShamsiDisplay'), generateReportBtn: document.getElementById('generateReportBtn'), reportResultsContainer: document.getElementById('reportResultsContainer'), reportTableBody: document.getElementById('reportTableBody'), reportSummaryContainer: document.getElementById('reportSummaryContainer'), reportSummaryGrid: document.getElementById('reportSummaryGrid'), noReportData: document.getElementById('noReportData'), settingStdStartTimeInput: document.getElementById('settingStdStartTime'), settingStdEndTimeInput: document.getElementById('settingStdEndTime'), settingDailyWorkHoursInput: document.getElementById('settingDailyWorkHours'), settingMaxOvertimeInput: document.getElementById('settingMaxOvertime'), settingPeriodStartMonthSelect: document.getElementById('settingPeriodStartMonth'), settingPeriodYearInput: document.getElementById('settingPeriodYear'), newHolidayYearInput: document.getElementById('newHolidayYear'), newHolidayMonthSelect: document.getElementById('newHolidayMonth'), newHolidayDayInput: document.getElementById('newHolidayDay'), addHolidayBtn: document.getElementById('addHolidayBtn'), currentHolidaysListDiv: document.getElementById('currentHolidaysList'), settingAutoFillEndTimeCheckbox: document.getElementById('settingAutoFillEndTime'), saveSettingsBtn: document.getElementById('saveSettingsBtn'), exportCsvBtn: document.getElementById('exportCsvBtn'), exportJsonBtn: document.getElementById('exportJsonBtn'), createBackupBtn: document.getElementById('createBackupBtn'), backupFileInput: document.getElementById('backupFile'), clearAllDataBtn: document.getElementById('clearAllDataBtn'), statTotalRecords: document.getElementById('statTotalRecords'), statFirstRecordDate: document.getElementById('statFirstRecordDate'), statLastRecordDate: document.getElementById('statLastRecordDate'), statDataSize: document.getElementById('statDataSize'), tabButtons: document.querySelectorAll('.tab-btn'), tabContents: document.querySelectorAll('.tab-content'),
        };
        this.Settings.load(); this.Storage.loadEntries(); this.Events.setupEventListeners();
        this.UI.populateMonthSelect(this.DOM.settingPeriodStartMonthSelect, this.state.appSettings.periodStartMonth);
        this.UI.populateMonthSelect(this.DOM.newHolidayMonthSelect); 
        this.UI.populateMonthFilterSelect(); this.UI.resetEntryForm(); this.UI.displayWorkEntries();
        this.UI.updateDashboard(); this.UI.updateSystemStats(); this.UI.showTab('dashboard');
        this.Report.setDefaultReportDates();
        this.UI.updateShamsiDateDisplay(this.DOM.workDateInput.value, this.DOM.workDateShamsiDisplay);
        this.UI.updateShamsiDateDisplay(this.DOM.reportFromDateInput.value, this.DOM.reportFromDateShamsiDisplay);
        this.UI.updateShamsiDateDisplay(this.DOM.reportToDateInput.value, this.DOM.reportToDateShamsiDisplay);
    },

    Events: {
        setupEventListeners: function() { 
            App.DOM.tabButtons.forEach(btn => btn.addEventListener('click', () => App.UI.showTab(btn.dataset.tab, btn)));
            App.DOM.workDateInput.addEventListener('change', (e) => { App.UI.updateShamsiDateDisplay(e.target.value, App.DOM.workDateShamsiDisplay); App.UI.checkAndDisplayHolidayStatus(e.target.value); App.Utils.debounce(App.UI.autoFillEndTime, App.config.debounceDelay)(); });
            App.DOM.reportFromDateInput.addEventListener('change', (e) => App.UI.updateShamsiDateDisplay(e.target.value, App.DOM.reportFromDateShamsiDisplay));
            App.DOM.reportToDateInput.addEventListener('change', (e) => App.UI.updateShamsiDateDisplay(e.target.value, App.DOM.reportToDateShamsiDisplay));
            App.DOM.isDailyLeaveCheckbox.addEventListener('change', App.UI.toggleTimeInputsBasedOnDailyLeave);
            App.DOM.saveWorkEntryBtn.addEventListener('click', () => App.Data.saveWorkEntry());
            App.DOM.clearEntryFormBtn.addEventListener('click', () => App.UI.resetEntryForm(true));
            if (App.DOM.startTimeInput) App.DOM.startTimeInput.addEventListener('change', App.Utils.debounce(App.UI.autoFillEndTime, App.config.debounceDelay));
            App.DOM.entryFilterMonthSelect.addEventListener('change', (e) => { App.state.filterMonth = e.target.value; App.UI.displayWorkEntries(); });
            App.DOM.entrySortOrderSelect.addEventListener('change', (e) => { App.state.sortOrder = e.target.value; App.UI.displayWorkEntries(); });
            App.DOM.generateReportBtn.addEventListener('click', () => App.Report.generate());
            App.DOM.saveSettingsBtn.addEventListener('click', () => App.Settings.save());
            App.DOM.addHolidayBtn.addEventListener('click', () => App.Settings.addHolidayToList());
            App.DOM.currentHolidaysListDiv.addEventListener('click', (event) => { if (event.target.classList.contains('delete-holiday-btn')) App.Settings.removeHolidayFromList(event.target.dataset.holiday); });
            App.DOM.exportCsvBtn.addEventListener('click', () => App.Export.toCSV()); App.DOM.exportJsonBtn.addEventListener('click', () => App.Export.toJSON());
            App.DOM.createBackupBtn.addEventListener('click', () => App.Export.createBackup()); App.DOM.backupFileInput.addEventListener('change', (event) => App.Export.restoreBackup(event)); App.DOM.clearAllDataBtn.addEventListener('click', () => App.Export.clearAllData());
            App.DOM.workEntriesListContainer.addEventListener('click', function(event) { const tB=event.target.closest('button'); if(tB&&tB.classList.contains('edit-entry-btn'))App.UI.populateFormForEdit(tB.dataset.id); else if(tB&&tB.classList.contains('delete-entry-btn'))App.Data.deleteWorkEntry(tB.dataset.id); });
        }
    },

    UI: { 
        showTab: function(tabId, clickedButton = null) { App.DOM.tabContents.forEach(t=>t.classList.remove('active'));App.DOM.tabButtons.forEach(b=>b.classList.remove('active'));const aTC=document.getElementById(tabId);if(aTC)aTC.classList.add('active');if(clickedButton)clickedButton.classList.add('active');else{const bTA=Array.from(App.DOM.tabButtons).find(b=>b.dataset.tab===tabId);if(bTA)bTA.classList.add('active');} if(tabId==='dashboard')App.UI.updateDashboard();else if(tabId==='entry')App.UI.displayWorkEntries();else if(tabId==='settings')App.Settings.populateForm();else if(tabId==='export')App.UI.updateSystemStats();},
        showNotification: function(message, type = 'info', duration = 3500) { const n=document.createElement('div');n.className=`notification ${type}`;n.textContent=message;App.DOM.notificationArea.appendChild(n);setTimeout(()=>n.remove(),duration);},
        updateShamsiDateDisplay: function(gregorianDateStr, displayElement) { if(displayElement)displayElement.textContent=App.JalaliDate.gregorianToJalaaliString(gregorianDateStr);},
        checkAndDisplayHolidayStatus: function(gregorianDateStr) { const sD=App.JalaliDate.gregorianToJalaaliString(gregorianDateStr);const iH=(App.state.appSettings.holidays || []).includes(sD);App.DOM.holidayIndicator.textContent=iH?'تعطیل رسمی':'';App.DOM.isManualHolidayCheckbox.checked=iH;},
        toggleTimeInputsBasedOnDailyLeave: function() { const iD=App.DOM.isDailyLeaveCheckbox.checked;App.DOM.timeInputsContainer.classList.toggle('disabled-inputs',iD);if(iD){App.DOM.startTimeInput.value='';App.DOM.endTimeInput.value='';App.DOM.breakTimeInput.value='0';App.DOM.hourlyLeaveInput.value='0';}else{App.DOM.startTimeInput.value=App.state.appSettings.standardStartTime;App.UI.autoFillEndTime();}},
        populateMonthSelect: function(selectElement, selectedValue = null) { if(!selectElement)return;selectElement.innerHTML='';App.config.persianMonths.forEach((m,i)=>{const o=document.createElement('option');o.value=i+1;o.textContent=m;if(selectedValue&&parseInt(selectedValue)===(i+1))o.selected=true;selectElement.appendChild(o);});},
        populateMonthFilterSelect: function() { const s=App.DOM.entryFilterMonthSelect;if(!s)return;const cV=s.value;s.innerHTML='<option value="all">همه ماه‌ها</option>';const uM=[...new Set(App.state.workEntries.map(e=>{const{jy,jm}=App.JalaliDate.toJalaali(...e.date.split('-').map(Number));return`${jy}/${String(jm).padStart(2,'0')}`;}))].sort((a,b)=>b.localeCompare(a));uM.forEach(sYM=>{const[y,mN]=sYM.split('/');const mNa=App.config.persianMonths[parseInt(mN)-1];const o=document.createElement('option');o.value=sYM;o.textContent=`${mNa} ${y}`;if(sYM===cV)o.selected=true;s.appendChild(o);});},
        resetEntryForm: function(clearDescription = false) { App.state.editingEntryId=null;App.DOM.editingEntryIdInput.value='';App.DOM.entryFormTitle.textContent='ثبت اطلاعات';App.DOM.saveWorkEntryBtn.textContent='ثبت اطلاعات';App.DOM.saveWorkEntryBtn.classList.remove('btn-warning');const t=new Date().toISOString().split('T')[0];App.DOM.workDateInput.value=t;App.UI.updateShamsiDateDisplay(t,App.DOM.workDateShamsiDisplay);App.UI.checkAndDisplayHolidayStatus(t);App.DOM.isDailyLeaveCheckbox.checked=false;App.DOM.isManualHolidayCheckbox.checked=(App.state.appSettings.holidays || []).includes(App.JalaliDate.gregorianToJalaaliString(t));App.UI.toggleTimeInputsBasedOnDailyLeave();App.DOM.breakTimeInput.value='0';App.DOM.hourlyLeaveInput.value='0';if(clearDescription)App.DOM.workDescriptionInput.value='';App.DOM.workDateInput.focus();},
        autoFillEndTime: function() { if(!App.state.appSettings.autoFillEndTime||App.state.editingEntryId||App.DOM.isDailyLeaveCheckbox.checked)return;const sDS=App.DOM.workDateInput.value;const sTS=App.DOM.startTimeInput.value;const dH=parseFloat(App.state.appSettings.dailyWorkHours);if(sDS&&sTS&&!isNaN(dH)&&dH>0){try{const sDT=new Date(`${sDS}T${sTS}`);if(isNaN(sDT.getTime())){App.DOM.endTimeInput.value='';return;}const eT=new Date(sDT.getTime()+dH*60*60*1000);App.DOM.endTimeInput.value=`${eT.getHours().toString().padStart(2,'0')}:${eT.getMinutes().toString().padStart(2,'0')}`; }catch(e){App.DOM.endTimeInput.value='';}}else App.DOM.endTimeInput.value='';},
        populateFormForEdit: function(entryId) { const e=App.state.workEntries.find(i=>i.id===entryId);if(!e){App.UI.showNotification('رکورد یافت نشد.','error');return;}App.state.editingEntryId=e.id;App.DOM.editingEntryIdInput.value=e.id;App.DOM.entryFormTitle.textContent='ویرایش اطلاعات';App.DOM.saveWorkEntryBtn.textContent='ذخیره تغییرات';App.DOM.saveWorkEntryBtn.classList.add('btn-warning');App.DOM.workDateInput.value=e.date;App.UI.updateShamsiDateDisplay(e.date,App.DOM.workDateShamsiDisplay);App.UI.checkAndDisplayHolidayStatus(e.date);App.DOM.isDailyLeaveCheckbox.checked=e.isDailyLeave||false;App.DOM.isManualHolidayCheckbox.checked=e.isManualHoliday||false;App.UI.toggleTimeInputsBasedOnDailyLeave();if(!e.isDailyLeave){App.DOM.startTimeInput.value=e.startTime;App.DOM.endTimeInput.value=e.endTime;App.DOM.breakTimeInput.value=e.breakTime;App.DOM.hourlyLeaveInput.value=e.hourlyLeaveMinutes||0;}App.DOM.workDescriptionInput.value=e.description;App.UI.showTab('entry');App.DOM.workDateInput.focus();},
        displayWorkEntries: function() {
            const container = App.DOM.workEntriesListContainer; if (!container) return;
            let filteredEntries = [...App.state.workEntries];
            if (App.state.filterMonth !== 'all') filteredEntries = filteredEntries.filter(e => { const {jy,jm} = App.JalaliDate.toJalaali(...e.date.split('-').map(Number)); return `${jy}/${String(jm).padStart(2,'0')}` === App.state.filterMonth; });
            filteredEntries.sort((a,b) => { const dA = new Date(a.date + 'T' + (a.startTime||'00:00')); const dB = new Date(b.date + 'T' + (b.startTime||'00:00')); return App.state.sortOrder === 'desc' ? dB - dA : dA - dB; }); 
            App.DOM.totalEntriesCount.textContent = filteredEntries.length;
            if (filteredEntries.length === 0) { container.innerHTML = '<div class="entry-item" style="text-align:center;">رکوردی یافت نشد.</div>'; return; }
            container.innerHTML = filteredEntries.map(entry => {
                const shamsiDate = App.JalaliDate.gregorianToJalaaliString(entry.date);
                let statusBadges = '';
                let itemClass = 'entry-item';
                if (entry.isPredefinedHoliday) { statusBadges += '<span class="entry-status-badge badge-predefined-holiday">تعطیل رسمی</span>'; itemClass += ' is-predefined-holiday';}
                if (entry.isManualHoliday && !entry.isPredefinedHoliday) { statusBadges += '<span class="entry-status-badge badge-manual-holiday">تعطیل دستی</span>'; itemClass += ' is-manual-holiday'; }
                else if (entry.isManualHoliday && entry.isPredefinedHoliday) { statusBadges = '<span class="entry-status-badge badge-predefined-holiday">تعطیل رسمی/دستی</span>'; itemClass += ' is-predefined-holiday is-manual-holiday';} 
                if (entry.isDailyLeave) { statusBadges += '<span class="entry-status-badge badge-daily-leave">مرخصی روزانه</span>'; itemClass += ' is-daily-leave'; }
                
                let leaveInfoText = '';
                if (!entry.isDailyLeave && entry.hourlyLeaveMinutes > 0) leaveInfoText = `<span class="entry-leave-info">مرخصی ساعتی: ${entry.hourlyLeaveMinutes} دقیقه</span>`;
                
                return `<div class="${itemClass}">
                    <div class="entry-header">
                        <span class="entry-date">${shamsiDate} ${statusBadges}</span>
                        <div class="entry-actions">
                            <button class="btn btn-sm btn-warning edit-entry-btn" data-id="${entry.id}">ویرایش</button>
                            <button class="btn btn-sm btn-danger delete-entry-btn" data-id="${entry.id}">حذف</button>
                        </div>
                    </div>
                    ${!entry.isDailyLeave ? `<p>شروع: ${entry.startTime}, پایان: ${entry.endTime} | استراحت: ${entry.breakTime} دقیقه <br>کل کار: ${App.Utils.formatHours(entry.totalHours)} | عادی: ${App.Utils.formatHours(entry.regularHours)} | اضافه: ${App.Utils.formatHours(entry.overtimeHours)}</p>` : ''}
                    ${leaveInfoText}
                    ${entry.description ? `<p class="entry-description">${App.Utils.escapeHTML(entry.description)}</p>` : ''}
                </div>`}).join('');
        },
        updateDashboard: function() {
            const todayGregorian = new Date();
            const currentShamsi = App.JalaliDate.toJalaali(todayGregorian);

            let startPeriodShamsiYear = currentShamsi.jy;
            let startPeriodShamsiMonth = currentShamsi.jm - 1;
            if (startPeriodShamsiMonth < 1) { 
                startPeriodShamsiMonth = 12;
                startPeriodShamsiYear -= 1;
            }
            const startPeriodShamsiDay = 25;
            const endPeriodShamsi = currentShamsi; 

            const gStartObj = App.JalaliDate.toGregorian(startPeriodShamsiYear, startPeriodShamsiMonth, startPeriodShamsiDay);
            const gregorianStartDate = new Date(gStartObj.gy, gStartObj.gm - 1, gStartObj.gd, 0, 0, 0);
            const gregorianEndDate = new Date(todayGregorian.getFullYear(), todayGregorian.getMonth(), todayGregorian.getDate(), 23, 59, 59); 

            App.DOM.dashboardPeriodDisplay.textContent = `دوره: از ${App.JalaliDate.formatJalaali(startPeriodShamsiYear, startPeriodShamsiMonth, startPeriodShamsiDay)} تا ${App.JalaliDate.formatJalaali(endPeriodShamsi.jy, endPeriodShamsi.jm, endPeriodShamsi.jd)}`;
            
            const entriesInPeriod = App.state.workEntries.filter(e => {
                const entryDate = new Date(e.date + "T00:00:00");
                return !e.isDailyLeave && entryDate >= gregorianStartDate && entryDate <= gregorianEndDate;
            });

            let totalDays = new Set(entriesInPeriod.map(e => e.date)).size;
            let totalHours = entriesInPeriod.reduce((sum, e) => sum + e.totalHours, 0);
            let overtimeHours = entriesInPeriod.reduce((sum, e) => sum + e.overtimeHours, 0);
            let avgHours = totalDays > 0 ? totalHours / totalDays : 0;
            let totalHourlyLeaveMinutesInPeriod = App.state.workEntries.filter(e => {
                 const entryDate = new Date(e.date + "T00:00:00");
                 return !e.isDailyLeave && e.hourlyLeaveMinutes > 0 && entryDate >= gregorianStartDate && entryDate <= gregorianEndDate;
            }).reduce((sum,e)=> sum + (e.hourlyLeaveMinutes || 0), 0);
            let totalDailyLeavesInPeriod = App.state.workEntries.filter(e => {
                 const entryDate = new Date(e.date + "T00:00:00");
                 return e.isDailyLeave && entryDate >= gregorianStartDate && entryDate <= gregorianEndDate;
            }).length;

            App.DOM.dashboardStatsContainer.innerHTML = `
                <div class="stats-card"><h3>روز کاری در دوره</h3><div class="big-number">${totalDays}</div></div>
                <div class="stats-card"><h3>مجموع ساعت کار</h3><div class="big-number">${App.Utils.formatHours(totalHours)}</div></div>
                <div class="stats-card"><h3>اضافه‌کاری</h3><div class="big-number">${App.Utils.formatHours(overtimeHours)}</div></div>
                <div class="stats-card"><h3>میانگین روزانه</h3><div class="big-number">${App.Utils.formatHours(avgHours)}</div></div>
                <div class="stats-card"><h3>مرخصی ساعتی (دقیقه)</h3><div class="big-number">${totalHourlyLeaveMinutesInPeriod}</div></div>
                <div class="stats-card"><h3>مرخصی روزانه (روز)</h3><div class="big-number">${totalDailyLeavesInPeriod}</div></div>
                `;
            
            const sortedEntries = [...App.state.workEntries].sort((a,b)=>new Date(b.date+'T'+(b.startTime||'00:00')) - new Date(a.date+'T'+(a.startTime||'00:00')));
            const recentToDisplay = sortedEntries.slice(0, 5);
            App.DOM.recentEntriesCount.textContent = recentToDisplay.length; 
            App.DOM.recentEntriesContainer.innerHTML=recentToDisplay.length===0?'<div class="entry-item" style="text-align:center;">اطلاعاتی نیست.</div>':recentToDisplay.map(e=>
            `<div class="entry-item"><div class="entry-header"><span class="entry-date">${App.JalaliDate.gregorianToJalaaliString(e.date)} ${e.isPredefinedHoliday||e.isManualHoliday?'(تعطیل)':''}</span><span>${e.isDailyLeave?'مرخصی‌روزانه':App.Utils.formatHours(e.totalHours)+' ساعت'}</span></div>
            ${e.hourlyLeaveMinutes>0?`<span class="entry-leave-info">مرخصی‌ساعتی: ${e.hourlyLeaveMinutes}دقیقه</span>`:''} ${e.description?`<p class="entry-description">${App.Utils.escapeHTML(e.description)}</p>`:''}</div>`).join('');
        },
        updateSystemStats: function() { App.DOM.statTotalRecords.textContent=App.state.workEntries.length;if(App.state.workEntries.length>0){const d=App.state.workEntries.map(e=>new Date(e.date+"T00:00:00")).sort((a,b)=>a-b);App.DOM.statFirstRecordDate.textContent=App.JalaliDate.gregorianToJalaaliString(d[0].toISOString().split('T')[0]);App.DOM.statLastRecordDate.textContent=App.JalaliDate.gregorianToJalaaliString(d[d.length-1].toISOString().split('T')[0]);}else{App.DOM.statFirstRecordDate.textContent='-';App.DOM.statLastRecordDate.textContent='-';}const dS=App.Utils.estimateLocalStorageSize(App.config.STORAGE_KEYS.entries)+App.Utils.estimateLocalStorageSize(App.config.STORAGE_KEYS.settings);App.DOM.statDataSize.textContent=`${(dS/1024).toFixed(2)} KB`;}
    },

    Data: { 
        saveWorkEntry: function() {
            const isDailyLeave = App.DOM.isDailyLeaveCheckbox.checked; const isManualHoliday = App.DOM.isManualHolidayCheckbox.checked;
            const gregorianDate = App.DOM.workDateInput.value; const shamsiDateForHolidayCheck = App.JalaliDate.gregorianToJalaaliString(gregorianDate);
            const isPredefinedHoliday = (App.state.appSettings.holidays || []).includes(shamsiDateForHolidayCheck);
            const entryData = {id:App.state.editingEntryId||App.Utils.generateId(),date:gregorianDate,startTime:isDailyLeave?'':App.DOM.startTimeInput.value,endTime:isDailyLeave?'':App.DOM.endTimeInput.value,breakTime:isDailyLeave?0:(parseInt(App.DOM.breakTimeInput.value)||0),hourlyLeaveMinutes:isDailyLeave?0:(parseInt(App.DOM.hourlyLeaveInput.value)||0),description:App.DOM.workDescriptionInput.value.trim(),isDailyLeave:isDailyLeave,isPredefinedHoliday:isPredefinedHoliday,isManualHoliday:isManualHoliday,};
            if(!entryData.date){App.UI.showNotification('تاریخ الزامی.','error');return;}if(!isDailyLeave&&(!entryData.startTime||!entryData.endTime)){App.UI.showNotification('ساعت شروع/پایان الزامی.','error');return;}
            const effectiveHoliday=isPredefinedHoliday||isManualHoliday;
            if(isDailyLeave){entryData.totalHours=0;entryData.regularHours=0;entryData.overtimeHours=0;}else{try{const s=new Date(`${entryData.date}T${entryData.startTime}`);const e=new Date(`${entryData.date}T${entryData.endTime}`);if(isNaN(s.getTime())||isNaN(e.getTime())){App.UI.showNotification('فرمت ساعت نامعتبر.','error');return;}if(s>=e){App.UI.showNotification('پایان باید بعد از شروع.','error');return;}
            let tWM=(e-s)/(1e3*60)-entryData.breakTime-entryData.hourlyLeaveMinutes;if(tWM<0)tWM=0;entryData.totalHours=parseFloat((tWM/60).toFixed(2));const dWHS=parseFloat(App.state.appSettings.dailyWorkHours);if(effectiveHoliday){entryData.regularHours=0;entryData.overtimeHours=entryData.totalHours;}else{entryData.regularHours=Math.min(entryData.totalHours,dWHS);entryData.overtimeHours=Math.max(0,entryData.totalHours-dWHS);}}catch(e){App.UI.showNotification('خطا در محاسبه ساعات.','error');return;}}
            if(App.state.editingEntryId){const i=App.state.workEntries.findIndex(e=>e.id===App.state.editingEntryId);App.state.workEntries[i]=entryData;App.UI.showNotification('ویرایش شد.','success');}else{App.state.workEntries.push(entryData);App.UI.showNotification('ثبت شد.','success');}
            App.Storage.saveEntries();App.UI.resetEntryForm(true);App.UI.displayWorkEntries();App.UI.updateDashboard();App.UI.updateSystemStats();App.UI.populateMonthFilterSelect();
        },
        deleteWorkEntry: function(entryId) { if(confirm('حذف شود؟')){App.state.workEntries=App.state.workEntries.filter(e=>e.id!==entryId);App.Storage.saveEntries();App.UI.showNotification('حذف شد.','info');App.UI.displayWorkEntries();App.UI.updateDashboard();App.UI.updateSystemStats();App.UI.populateMonthFilterSelect();if(App.state.editingEntryId===entryId)App.UI.resetEntryForm();} }
    },

    Settings: {
        load: function() { try{const sS=localStorage.getItem(App.config.STORAGE_KEYS.settings);if(sS)App.state.appSettings={...App.config.defaultSettings,...JSON.parse(sS)};else App.state.appSettings={...App.config.defaultSettings};if(typeof App.state.appSettings.holidays==='string')App.state.appSettings.holidays=App.state.appSettings.holidays.split(',').map(s=>s.trim()).filter(Boolean);else if(!Array.isArray(App.state.appSettings.holidays))App.state.appSettings.holidays=[...App.config.defaultSettings.holidays];App.state.tempHolidays=[...(App.state.appSettings.holidays||[])];}catch(e){App.state.appSettings={...App.config.defaultSettings};App.state.tempHolidays=[...App.config.defaultSettings.holidays];App.UI.showNotification('خطا بارگذاری تنظیمات.','error');}this.populateForm();},
        save: function() { App.state.appSettings.standardStartTime=App.DOM.settingStdStartTimeInput.value;App.state.appSettings.standardEndTime=App.DOM.settingStdEndTimeInput.value;App.state.appSettings.dailyWorkHours=parseFloat(App.DOM.settingDailyWorkHoursInput.value)||8;App.state.appSettings.maxOvertimeHours=parseFloat(App.DOM.settingMaxOvertimeInput.value)||4;App.state.appSettings.periodStartMonth=parseInt(App.DOM.settingPeriodStartMonthSelect.value);App.state.appSettings.periodYear=parseInt(App.DOM.settingPeriodYearInput.value);App.state.appSettings.holidays=[...(App.state.tempHolidays||[])].sort();App.state.appSettings.autoFillEndTime=App.DOM.settingAutoFillEndTimeCheckbox.checked;try{localStorage.setItem(App.config.STORAGE_KEYS.settings,JSON.stringify(App.state.appSettings));App.UI.showNotification('تنظیمات ذخیره شد.','success');App.UI.updateDashboard();App.UI.resetEntryForm();this.renderHolidayList();}catch(e){App.UI.showNotification('خطا ذخیره تنظیمات.','error');}},
        populateForm: function() { App.DOM.settingStdStartTimeInput.value=App.state.appSettings.standardStartTime;App.DOM.settingStdEndTimeInput.value=App.state.appSettings.standardEndTime;App.DOM.settingDailyWorkHoursInput.value=App.state.appSettings.dailyWorkHours;App.DOM.settingMaxOvertimeInput.value=App.state.appSettings.maxOvertimeHours;App.DOM.settingPeriodStartMonthSelect.value=App.state.appSettings.periodStartMonth;App.DOM.settingPeriodYearInput.value=App.state.appSettings.periodYear;App.DOM.settingAutoFillEndTimeCheckbox.checked=App.state.appSettings.autoFillEndTime;this.renderHolidayList();},
        renderHolidayList: function() {
            App.DOM.currentHolidaysListDiv.innerHTML = '';
            if (!App.state.tempHolidays || App.state.tempHolidays.length === 0) { App.DOM.currentHolidaysListDiv.innerHTML = '<span>لیست تعطیلات خالی است.</span>'; return; }
            App.state.tempHolidays.sort().forEach(holiday => {
                const item = document.createElement('div'); item.className = 'holiday-list-item';
                item.innerHTML = `<span>${holiday}</span><button class="btn btn-danger btn-sm delete-holiday-btn" data-holiday="${holiday}" style="padding: 3px 8px; font-size: 0.8em;">حذف</button>`;
                App.DOM.currentHolidaysListDiv.appendChild(item);
            });
        },
        addHolidayToList: function() {
            const year = App.DOM.newHolidayYearInput.value.trim(); const month = App.DOM.newHolidayMonthSelect.value; const day = App.DOM.newHolidayDayInput.value.trim();
            if (!year || !month || !day) { App.UI.showNotification('لطفا سال، ماه و روز تعطیلی را وارد کنید.', 'error'); return; }
            try { 
                const jDate = {jy: parseInt(year), jm: parseInt(month), jd: parseInt(day) };
                const gDateTest = App.JalaliDate.toGregorian(jDate.jy, jDate.jm, jDate.jd);
                const reconstructedJDate = App.JalaliDate.toJalaali(gDateTest.gy, gDateTest.gm, gDateTest.gd);
                if(reconstructedJDate.jd !== jDate.jd || reconstructedJDate.jm !== jDate.jm || reconstructedJDate.jy !== jDate.jy) {
                     App.UI.showNotification('تاریخ شمسی وارد شده معتبر نیست.', 'error'); return;
                }
            } catch (e) { App.UI.showNotification('فرمت تاریخ شمسی نامعتبر است.', 'error'); return;}
            const holidayStr = App.JalaliDate.formatJalaali(parseInt(year), parseInt(month), parseInt(day));
            if (!App.state.tempHolidays.includes(holidayStr)) { App.state.tempHolidays.push(holidayStr); this.renderHolidayList(); App.DOM.newHolidayYearInput.value = ''; App.DOM.newHolidayDayInput.value = ''; } 
            else { App.UI.showNotification('این تاریخ قبلا اضافه شده.', 'info'); }
        },
        removeHolidayFromList: function(holidayStr) { App.state.tempHolidays = App.state.tempHolidays.filter(h => h !== holidayStr); this.renderHolidayList(); }
    },
    Storage: { loadEntries:function(){try{const s=localStorage.getItem(App.config.STORAGE_KEYS.entries);App.state.workEntries=s?JSON.parse(s):[];}catch(e){App.state.workEntries=[];App.UI.showNotification('خطا بارگذاری رکوردها.','error');}},saveEntries:function(){try{localStorage.setItem(App.config.STORAGE_KEYS.entries,JSON.stringify(App.state.workEntries));}catch(e){App.UI.showNotification('خطا ذخیره رکوردها.','error');}}},

    Report: { setDefaultReportDates:function(){const tD=new Date();const fD=new Date(tD.getFullYear(),tD.getMonth(),1);App.DOM.reportFromDateInput.value=fD.toISOString().split('T')[0];App.DOM.reportToDateInput.value=tD.toISOString().split('T')[0];App.UI.updateShamsiDateDisplay(App.DOM.reportFromDateInput.value,App.DOM.reportFromDateShamsiDisplay);App.UI.updateShamsiDateDisplay(App.DOM.reportToDateInput.value,App.DOM.reportToDateShamsiDisplay);},generate:function(){const f=App.DOM.reportFromDateInput.value;const t=App.DOM.reportToDateInput.value;if(!f||!t){App.UI.showNotification('بازه تاریخ گزارش را مشخص کنید.','error');return;}const fD=new Date(f+"T00:00:00");const tD=new Date(t+"T23:59:59");if(fD>tD){App.UI.showNotification('شروع بعد از پایان نباشد.','error');return;}const rD=App.state.workEntries.filter(e=>{const d=new Date(e.date+"T00:00:00");return d>=fD&&d<=tD;}).sort((a,b)=>new Date(a.date+"T"+(a.startTime||"00:00"))-new Date(b.date+"T"+(b.startTime||"00:00")));App.DOM.reportTableBody.innerHTML='';App.DOM.reportSummaryGrid.innerHTML='';if(rD.length===0){App.DOM.reportResultsContainer.style.display='none';App.DOM.noReportData.innerHTML='داده‌ای یافت نشد.';App.DOM.noReportData.style.display='block';return;}App.DOM.noReportData.style.display='none';App.DOM.reportResultsContainer.style.display='block';App.DOM.reportSummaryContainer.style.display='block';rD.forEach(e=>{const r=App.DOM.reportTableBody.insertRow();let hST="";if(e.isPredefinedHoliday&&e.isManualHoliday)hST="رسمی/دستی";else if(e.isPredefinedHoliday)hST="رسمی";else if(e.isManualHoliday)hST="دستی";r.insertCell().textContent=App.JalaliDate.gregorianToJalaaliString(e.date);r.insertCell().textContent=hST;r.insertCell().textContent=e.isDailyLeave?'بله':'خیر';r.insertCell().textContent=e.isDailyLeave?'-':e.startTime;r.insertCell().textContent=e.isDailyLeave?'-':e.endTime;r.insertCell().textContent=e.isDailyLeave?'-':e.breakTime;r.insertCell().textContent=e.isDailyLeave?'-':(e.hourlyLeaveMinutes||0);r.insertCell().textContent=App.Utils.formatHours(e.totalHours);r.insertCell().textContent=App.Utils.formatHours(e.regularHours);r.insertCell().textContent=App.Utils.formatHours(e.overtimeHours);r.insertCell().textContent=App.Utils.escapeHTML(e.description.substring(0,20))+(e.description.length>20?'...':'');});const tWD=new Set(rD.filter(e=>!e.isDailyLeave&&e.totalHours>0).map(e=>e.date)).size;const tDL=rD.filter(e=>e.isDailyLeave).length;const tHLM=rD.reduce((s,e)=>s+(e.hourlyLeaveMinutes||0),0);const tH=rD.reduce((s,e)=>s+e.totalHours,0);const tR=rD.reduce((s,e)=>s+e.regularHours,0);const tO=rD.reduce((s,e)=>s+e.overtimeHours,0);App.DOM.reportSummaryGrid.innerHTML=[{l:'روزکاری‌موثر',v:tWD},{l:'کل‌مرخصی‌روزانه',v:tDL},{l:'کل‌مرخصی‌ساعتی(دقیقه)',v:tHLM},{l:'مجموع‌ساعت‌کار',v:App.Utils.formatHours(tH)},{l:'ساعت‌عادی',v:App.Utils.formatHours(tR)},{l:'اضافه‌کاری',v:App.Utils.formatHours(tO)}].map(i=>`<div class="summary-item"><div class="value">${i.v}</div><div class="label">${i.l}</div></div>`).join('');}},

    Export: { 
        toCSV:function(){if(App.state.workEntries.length===0){App.UI.showNotification('داده‌ای نیست.','info');return;}const h=['تاریخ‌شمسی','تعطیل‌رسمی','تعطیل‌دستی','مرخصی‌روزانه','شروع','پایان','استراحت( دق)','مرخصی‌ساعتی(دق)','کل‌ساعت','عادی','اضافه‌کاری','توضیحات'];const r=App.state.workEntries.map(e=>[App.JalaliDate.gregorianToJalaaliString(e.date),e.isPredefinedHoliday,e.isManualHoliday,e.isDailyLeave,e.startTime,e.endTime,e.breakTime,e.hourlyLeaveMinutes||0,e.totalHours,e.regularHours,e.overtimeHours,`"${(e.description||"").replace(/"/g,'""')}"`].join(','));App.Utils.downloadFile("data:text/csv;charset=utf-8,\uFEFF"+h.join(',')+'\n'+r.join('\n'),'work_entries_shamsi_v5.csv');},
        toJSON:function(){if(App.state.workEntries.length===0){App.UI.showNotification('داده‌ای نیست.','info');return;}App.Utils.downloadFile("data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(App.state.workEntries,null,2)),'work_entries_shamsi_v5.json');},
        createBackup: function() {
            try {
                const currentSettingsToBackup = JSON.parse(JSON.stringify(App.state.appSettings)); 
                currentSettingsToBackup.holidays = [...(App.state.tempHolidays || [])];
                const backupData = { entries: App.state.workEntries, settings: currentSettingsToBackup };
                const jsonContent = JSON.stringify(backupData, null, 2);
                if (!jsonContent || jsonContent === '{}') { throw new Error("Failed to stringify backup data or data is empty."); } 
                App.Utils.downloadFile("data:text/json;charset=utf-8," + encodeURIComponent(jsonContent), `backup_shamsi_v5_${new Date().toISOString().split('T')[0]}.json`);
                App.UI.showNotification('بکاپ ایجاد شد.', 'success');
            } catch (error) {
                console.error("Error creating backup:", error);
                App.UI.showNotification('خطا در ایجاد فایل بکاپ. جزئیات در کنسول.', 'error');
            }
        },
        restoreBackup:function(event){const f=event.target.files[0];if(!f)return;const r=new FileReader();r.onload=function(e_r){try{const b=JSON.parse(e_r.target.result);if(b&&b.entries&&b.settings){if(confirm('بازیابی از بکاپ؟')){App.state.workEntries=b.entries||[];App.state.appSettings={...App.config.defaultSettings,...(b.settings||{})};if(typeof App.state.appSettings.holidays==='string')App.state.appSettings.holidays=App.state.appSettings.holidays.split(',').map(s=>s.trim()).filter(Boolean);else if(!Array.isArray(App.state.appSettings.holidays))App.state.appSettings.holidays=[];App.state.tempHolidays=[...(App.state.appSettings.holidays||[])]; App.Storage.saveEntries();App.Settings.save();App.Settings.populateForm();App.UI.populateMonthSelect(App.DOM.settingPeriodStartMonthSelect,App.state.appSettings.periodStartMonth);App.UI.populateMonthFilterSelect();App.UI.showNotification('بازیابی موفق.','success');App.UI.resetEntryForm(true);App.UI.displayWorkEntries();App.UI.updateDashboard();App.UI.updateSystemStats();}}else App.UI.showNotification('فایل بکاپ نامعتبر.','error');}catch(err){App.UI.showNotification('خطا در پردازش بکاپ.','error');}finally{App.DOM.backupFileInput.value='';}};r.readAsText(f);},
        clearAllData: function() { if(confirm('هشدار! حذف تمام داده‌ها و تنظیمات؟')){localStorage.removeItem(App.config.STORAGE_KEYS.entries);localStorage.removeItem(App.config.STORAGE_KEYS.settings);App.state.workEntries=[];App.state.appSettings={...App.config.defaultSettings};App.state.tempHolidays=[...(App.config.defaultSettings.holidays||[])];App.state.editingEntryId=null;App.UI.showNotification('تمام داده‌ها پاک شدند.','success');App.Settings.populateForm();App.UI.resetEntryForm(true);App.UI.displayWorkEntries();App.UI.updateDashboard();App.UI.updateSystemStats();App.UI.populateMonthFilterSelect();App.Report.setDefaultReportDates();App.DOM.reportResultsContainer.style.display='none';App.DOM.noReportData.innerHTML='ابتدا گزارش تولید کنید.';App.DOM.noReportData.style.display='block';}}
    },
    Utils: { generateId:function(){return Date.now().toString(36)+Math.random().toString(36).substr(2,9);},escapeHTML:function(s){if(typeof s!=='string')return'';return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));},formatHours:function(h){return(typeof h==='number'?h.toFixed(2):'0.00').replace('.', '/');},downloadFile:function(c,fN){const l=document.createElement('a');l.href=c;l.download=fN;document.body.appendChild(l);l.click();document.body.removeChild(l);},estimateLocalStorageSize:function(k){const i=localStorage.getItem(k);return i?i.length*2:0;},debounce:function(f,d){let t;return function(...a){clearTimeout(t);t=setTimeout(()=>f.apply(this,a),d);};}}
};
document.addEventListener('DOMContentLoaded', () => App.init());
