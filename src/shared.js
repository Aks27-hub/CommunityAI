// shared.js - Central State Manager for City Champion

class CivicStateController {
    constructor() {
        this.storageKey = 'city_champion_state_v2';
        this.backendUrl = window.location.origin; // Dynamically connect to our Express server
        this.xpPerLevel = 1000;
        this.state = null;
        
        // Synchronously load from localStorage as fallback first, then hydrate
        this.loadLocalFallback();
        this.initDOMSync();
        this.hydrateFromBackend();
    }

    loadLocalFallback() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.state = JSON.parse(stored);
            } catch (error) {
                console.error('Error parsing localStorage', error);
            }
        }
        
        if (!this.state || !this.state.user || this.state.user.level === undefined) {
            // Profile starts strictly from 0
            this.state = {
                meta: {
                    schemaVersion: 2,
                    updatedAt: Date.now()
                },
                user: {
                    name: 'Guest Guardian',
                    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1tOGQJz3yqhixd-ZcEGUUZJXANIsJHgbi1A-N7zRFAa96g2Ltafivw67foCo9-MQXMBQt7HI07wA1sesQuc10M2WI3N2pwuPMTAB0VRTe7t1n2BBJFCRkv3S2fgd-6tjvkeCxMh8rdOQMhrPe9mIYP7p9lkZ8ooa5DWsNX5G4-4bhm1IfvwvgLTOqnBhEk_8cDE04xj91xUY3jAuvJtabdkpH_znqXW0RslsSVztB_rJ9bl9BrYT6IQQFY71LHc-vUVL7Xo5_cr8',
                    level: 0,
                    xp: 0,
                    streak: 0,
                    reputation: 0,
                    district: 'District 7',
                    checkInDate: null,
                    settings: {
                        anonymous: false,
                        notifications: true
                    }
                },
                reports: [],
                activities: []
            };
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        }
    }

    async hydrateFromBackend() {
        try {
            const response = await fetch(`${this.backendUrl}/api/state`, {
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                const remoteState = await response.json();
                
                // If it is the first hydration and DB is populated, use it.
                // Otherwise merge. Let's make sure the user profile starts from 0 if there are no activities or user is Guest.
                if (remoteState && remoteState.user) {
                    this.state = remoteState;
                    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
                    this.syncUI();
                }
            }
        } catch (error) {
            console.warn('Backend sync unavailable, utilizing offline storage', error);
        }
    }

    async save() {
        this.state.meta = this.state.meta || {};
        this.state.meta.updatedAt = Date.now();
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        
        try {
            await fetch(`${this.backendUrl}/api/state`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.state)
            });
        } catch (error) {
            console.warn('Backend save failed, offline state updated', error);
        }
        this.syncUI();
    }

    getLevelProgress() {
        const xp = this.state.user.xp || 0;
        const percent = Math.min(100, (xp / this.xpPerLevel) * 100);
        const remaining = Math.max(0, this.xpPerLevel - xp);
        return {
            xpIntoLevel: xp,
            xpPerLevel: this.xpPerLevel,
            percent,
            remaining
        };
    }

    addXp(amount) {
        this.state.user.xp = (this.state.user.xp || 0) + amount;
        let leveledUp = false;

        while (this.state.user.xp >= this.xpPerLevel) {
            this.state.user.xp -= this.xpPerLevel;
            this.state.user.level = (this.state.user.level || 0) + 1;
            leveledUp = true;
        }

        this.state.user.reputation = (this.state.user.reputation || 0) + Math.max(1, Math.floor(amount / 5));
        this.addActivity('bolt', 'XP Earned', `Earned ${amount} XP from community civic action.`);
        
        if (leveledUp) {
            this.toast('Level Up!', `You reached Civic Guardian Level ${this.state.user.level}!`, 'military_tech');
            this.addActivity('military_tech', `Leveled Up to Level ${this.state.user.level}`, `Reached Level ${this.state.user.level} through community action.`);
        } else {
            this.toast('XP Earned!', `+${amount} XP added to your profile.`, 'bolt');
        }

        this.save();
    }

    addActivity(icon, title, desc) {
        this.state.activities = this.state.activities || [];
        this.state.activities.unshift({
            icon,
            title,
            desc,
            time: 'Just now',
            timestamp: Date.now()
        });
        this.state.activities = this.state.activities.slice(0, 100);
        this.save();
    }

    getReportById(id) {
        return this.state.reports.find(report => report.id === id);
    }

    generateReportId() {
        let candidate = '';
        do {
            candidate = `#CC-${Math.floor(1000 + Math.random() * 9000)}`;
        } while (this.state.reports.some(report => report.id === candidate));
        return candidate;
    }

    async submitReport(category, severity, address, gps, img, extraAnalysis = null) {
        const reportId = this.generateReportId();
        const reporterName = this.state.user.settings.anonymous ? 'Anonymous Guardian' : this.state.user.name;
        const timestampLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const newReport = {
            id: reportId,
            title: extraAnalysis?.title || `${category} reported`,
            category: category,
            severity: severity,
            address: address || '1248 Oak Street, San Francisco, CA',
            gps: gps || '37.7749° N, 122.4194° W',
            trust: extraAnalysis?.confidence || 85,
            status: 'Reported',
            department: extraAnalysis?.department || 'Public Works',
            affected: extraAnalysis?.affected || '400+ Citizens',
            reporter: reporterName,
            date: timestampLabel,
            img: img || '',
            analysis: {
                source: extraAnalysis?.source || 'heuristic',
                confidence: extraAnalysis?.confidence || 85,
                summary: extraAnalysis?.summary || 'Citizen report pending community verification.',
                department: extraAnalysis?.department || 'Public Works'
            },
            timeline: [
                {
                    status: 'Reported',
                    date: 'Just now',
                    description: `Report submitted by ${reporterName}.`
                }
            ],
            comments: []
        };

        this.state.reports.unshift(newReport);
        this.addActivity('add_circle', 'Report Submitted', `${newReport.title} reported at ${newReport.address}.`);
        this.addXp(50);
        this.save();
        return reportId;
    }

    assignReportDepartment(id, department) {
        const report = this.getReportById(id);
        if (!report) return;

        report.department = department;
        report.status = 'In Progress';
        report.timeline = report.timeline || [];
        report.timeline.push({
            status: 'In Progress',
            date: 'Just now',
            description: `Dispatched to ${department} field team.`
        });

        this.toast('Dispatch Successful', `${report.title} assigned to ${department}.`, 'engineering');
        this.addActivity('construction', 'Task Assigned', `${report.title} assigned to ${department}.`);
        this.save();
    }

    verifyReport(id, verified) {
        const report = this.getReportById(id);
        if (!report) return;

        report.timeline = report.timeline || [];
        if (verified) {
            report.trust = Math.min(100, (report.trust || 0) + 5);
            if (report.status === 'Reported') {
                report.status = 'Verified';
            }
            report.timeline.push({
                status: 'Verified',
                date: 'Just now',
                description: 'Community verification confirmed the issue.'
            });
            this.toast('Verified', `Trust score for ${report.title} increased.`, 'check_circle');
            this.addXp(20);
            this.addActivity('group', 'Issue Verified', `Voted YES for issue ${report.id}.`);
        } else {
            report.trust = Math.max(0, (report.trust || 0) - 10);
            report.timeline.push({
                status: 'Flagged',
                date: 'Just now',
                description: 'Community verification flagged the issue for review.'
            });
            this.toast('Flagged', 'Report flagged and sent for review.', 'block');
            this.addActivity('block', 'Issue Flagged', `Flagged issue ${report.id} as incorrect or duplicate.`);
        }

        this.save();
    }

    addComment(id, text) {
        const report = this.getReportById(id);
        if (!report) return;

        report.comments = report.comments || [];
        report.timeline = report.timeline || [];
        report.comments.unshift({
            name: this.state.user.name,
            avatar: this.state.user.avatar,
            time: 'Just now',
            text
        });
        report.timeline.push({
            status: 'Commented',
            date: 'Just now',
            description: `New comment added by ${this.state.user.name}.`
        });

        this.toast('Comment Sent', 'Your comment has been added to the tracking feed.', 'send');
        this.addActivity('chat', 'Comment Added', `Comment added to ${report.title}.`);
        this.save();
    }

    toast(title, message, iconName = 'bolt') {
        if (typeof document === 'undefined' || !document.body) return;

        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'glass-panel p-4 rounded-2xl flex items-start gap-3 shadow-2xl border border-white/20 translate-x-12 opacity-0 transition-all duration-300 pointer-events-auto cursor-pointer bg-white/90 backdrop-blur-md';
        toast.innerHTML = `
            <div class="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-secondary">${iconName}</span>
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-primary text-sm">${title}</h4>
                <p class="text-xs text-on-surface-variant mt-0.5 leading-snug">${message}</p>
            </div>
        `;

        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('translate-x-12', 'opacity-0');
        }, 10);

        const closeToast = () => {
            toast.classList.add('translate-x-12', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        };

        toast.addEventListener('click', closeToast);
        setTimeout(closeToast, 4000);
    }

    syncUI() {
        if (typeof document === 'undefined') return;

        // Keep standard DOM tags updated
        document.querySelectorAll('[data-user-name]').forEach(element => {
            element.textContent = this.state.user.name;
        });

        document.querySelectorAll('[data-user-level]').forEach(element => {
            if (element.classList.contains('xp-level-number')) {
                element.textContent = this.state.user.level;
            } else {
                element.textContent = `Civic Guardian Level ${this.state.user.level}`;
            }
        });

        const progress = this.getLevelProgress();
        document.querySelectorAll('[data-user-xp]').forEach(element => {
            if (element.classList.contains('xp-bar-fill')) {
                element.style.width = `${progress.percent}%`;
            } else {
                element.textContent = `${progress.xpIntoLevel} / ${progress.xpPerLevel} XP`;
            }
        });

        document.querySelectorAll('[data-user-reputation]').forEach(element => {
            element.textContent = this.state.user.reputation.toLocaleString();
        });

        document.querySelectorAll('[data-user-avatar]').forEach(element => {
            if (element.tagName === 'IMG') {
                element.src = this.state.user.avatar;
            }
        });

        if (typeof window.onCivicStateSync === 'function') {
            window.onCivicStateSync(this.state);
        }
    }

    initDOMSync() {
        document.addEventListener('DOMContentLoaded', () => {
            this.syncUI();
            this.fixNavigationPaths();
        });
    }

    fixNavigationPaths() {
        const navMap = {
            home: 'city_center.html',
            add_circle: 'report.html',
            group: 'verify.html',
            analytics: 'track.html',
            account_circle: 'profile.html'
        };

        document.querySelectorAll('aside nav a, nav.fixed a, nav.fixed button').forEach(element => {
            let iconElement = element.querySelector('.material-symbols-outlined');
            if (!iconElement && element.classList.contains('material-symbols-outlined')) {
                iconElement = element;
            }
            if (!iconElement) return;

            const iconName = iconElement.getAttribute('data-icon') || iconElement.textContent.trim();
            const targetPage = navMap[iconName];
            if (!targetPage) return;

            if (element.tagName === 'A') {
                element.setAttribute('href', targetPage);
            } else if (element.tagName === 'BUTTON') {
                element.addEventListener('click', () => {
                    window.location.href = targetPage;
                });
            }
        });

        document.querySelectorAll('.material-symbols-outlined').forEach(icon => {
            const label = icon.textContent.trim();
            if (label === 'military_tech' || label === 'workspace_premium') {
                icon.style.cursor = 'pointer';
                icon.addEventListener('click', event => {
                    event.preventDefault();
                    window.location.href = 'leaderboard.html';
                });
            }
        });
    }
}

// Global initialization
window.civicController = new CivicStateController();
window.CivicState = window.civicController.state;
