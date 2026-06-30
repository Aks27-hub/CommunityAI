// shared.js - Central State Manager for City Champion

class CivicStateController {
    constructor() {
        this.storageKey = 'city_champion_state_v2';
        this.backendUrl = localStorage.getItem('civic_backend_url') || window.CIVIC_BACKEND_URL || 'http://localhost:8787';
        this.xpPerLevel = 1000;
        this.state = this.loadState();
        this.initDOMSync();
        this.hydrateFromBackend();
    }

    createInitialState() {
        return {
            meta: {
                schemaVersion: 2,
                updatedAt: Date.now()
            },
            user: {
                name: 'Alex Rivera',
                avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB30_5F-iRgx802d4JI1aXULgR9Y8GEdUebCtFrEBQFBSIRDKnjQsDm1Mv_YTxrlYhnETG41sgHj1ZGvv9DirJ9AXbTQ2-cPNWb0P3_nREk15xtKgoVZETMWBKOUJ5LqhpXj78eRz2NY7812lVJbZyFXdz5jJa245CLs-Nx2AOB-nfucFf_lDuoXsf6-2cZHf6fEqfnTAdsLbA5OZxiAkm6wxTIVz2k9Yyr5IfMTaMuiZl7SQaQwr5aiop9B167SqulyW4yLTjzlas',
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
            reports: [
                {
                    id: '#RU-902',
                    title: 'Water Main Leak',
                    category: 'Utilities',
                    severity: 'Critical',
                    address: '5th Avenue & Broadway',
                    gps: '37.7749° N, 122.4194° W',
                    trust: 80,
                    status: 'Reported',
                    affected: '12.4k Citizens',
                    reporter: 'System AI',
                    date: 'Oct 25, 2023',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAX7vMWWOLzyeaszMcVT3fkQpmBbifSymQGEWcoMnElAot4CdR5XydEDtWxjrSTHB18GO71Jd5mFXwnI6hIjRBrFNYkEOpvywQ92KE_h6uHYsY9zySiEcp5RmDqdgQppXHwL3fiaWCjzoOvKhV9AoctBwwwKSag2qhFt6g2MhYZHSaHk8BsKngbaJNcgP4HX3a_2cpWjGenhtdUn5zFtwUYr9R44cKc2qoyoMhm5NNgAwPkAXHwFVDpNqPHoHQfL_e917jtkVcZ-b0',
                    analysis: {
                        source: 'seed',
                        confidence: 96,
                        summary: 'AI detected a utility leak pattern from the submitted media.',
                        department: 'Utilities'
                    },
                    timeline: [
                        { status: 'Reported', date: 'Oct 24, 08:30 AM', description: 'Sensor network flagged sudden pressure drop.' }
                    ],
                    comments: []
                },
                {
                    id: '#RU-884',
                    title: 'Downed Power Line',
                    category: 'Traffic Safety',
                    severity: 'Moderate',
                    address: 'Oak Street Residential',
                    gps: '37.7712° N, 122.4156° W',
                    trust: 90,
                    status: 'Reported',
                    affected: '240 Citizens',
                    reporter: 'citizen_jane',
                    date: 'Oct 25, 2023',
                    img: '',
                    analysis: {
                        source: 'seed',
                        confidence: 92,
                        summary: 'AI classified the media as a traffic safety hazard.',
                        department: 'Public Works'
                    },
                    timeline: [
                        { status: 'Reported', date: 'Oct 24, 10:15 AM', description: 'Reported by resident via mobile application.' }
                    ],
                    comments: []
                },
                {
                    id: '#RU-712',
                    title: 'Pothole Cluster',
                    category: 'Road Infrastructure',
                    severity: 'Minor',
                    address: 'Highway 101 Onramp',
                    gps: '37.7689° N, 122.4089° W',
                    trust: 95,
                    status: 'In Progress',
                    department: 'Public Works',
                    affected: '5.1k Citizens',
                    reporter: 'System AI',
                    date: 'Oct 25, 2023',
                    img: '',
                    analysis: {
                        source: 'seed',
                        confidence: 99,
                        summary: 'Road surface degradation was detected by city AI.'
                    },
                    timeline: [
                        { status: 'Reported', date: 'Oct 23, 07:12 AM', description: 'Pothole scanning vehicle recorded cluster.' },
                        { status: 'Verified', date: 'Oct 23, 11:30 AM', description: 'AI confirmed priority based on traffic flow.' },
                        { status: 'In Progress', date: 'Oct 24, 09:00 AM', description: 'Public Works crew #3 dispatched to site.' }
                    ],
                    comments: []
                },
                {
                    id: '#CC-8829',
                    title: 'Pothole Repair',
                    category: 'Road Infrastructure',
                    severity: 'Moderate',
                    address: '42nd Avenue, Silicon District',
                    gps: '37.7749° N, 122.4194° W',
                    trust: 82,
                    status: 'In Progress',
                    department: 'Sanitation',
                    affected: '400+ Citizens',
                    reporter: 'Alex Rivera',
                    date: 'Oct 24, 2023',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB30_5F-iRgx802d4JI1aXULgR9Y8GEdUebCtFrEBQFBSIRDKnjQsDm1Mv_YTxrlYhnETG41sgHj1ZGvv9DirJ9AXbTQ2-cPNWb0P3_nREk15xtKgoVZETMWBKOUJ5LqhpXj78eRz2NY7812lVJbZyFXdz5jJa245CLs-Nx2AOB-nfucFf_lDuoXsf6-2cZHf6fEqfnTAdsLbA5OZxiAkm6wxTIVz2k9Yyr5IfMTaMuiZl7SQaQwr5aiop9B167SqulyW4yLTjzlas',
                    analysis: {
                        source: 'seed',
                        confidence: 94,
                        summary: 'Citizen photo report validated by AI.'
                    },
                    timeline: [
                        { status: 'Reported', date: 'Oct 24, 09:12 AM', description: 'Citizen photo report validated by AI.' },
                        { status: 'Verified', date: 'Oct 24, 02:45 PM', description: 'Ground inspection team confirmed priority Level 2.' },
                        { status: 'In Progress', date: 'Oct 25, 08:00 AM', description: 'Base layer applied. Asphalt paving scheduled.' }
                    ],
                    comments: [
                        { name: 'Officer Sarah Chen', time: '10m ago', text: 'Base layer applied. Asphalt paving scheduled for 14:00 today. Weather conditions optimal.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9xKynuRcLZuUe95aS8899w9pfZtrQN-MIn6G7H-Wu4kzTEfcz1CDPVsZ77pAmq2KNZ8yyFdZimZsgWn3ZhXPY1NNPYOvmgpGzv2SU-kbRdFMpnSWPkvKS33IIo1U6OXlyq4mEiyf_OJt7KdRv0fjXFDQNoRAF7zGxLPMLtqHpjILvDmlIIg-T1A22zGhWXolT72kgfHLiO8MExQSMlduun-Oz_fKNbbk8QO7cN0YPlB5AvxV16PDKXzRk7BXZtNTTuX_JYD7Ng24' }
                    ]
                },
                {
                    id: '#RU-124',
                    title: 'Sidewalk Hazard',
                    category: 'Road Infrastructure',
                    severity: 'Moderate',
                    address: 'West 4th & Baker Ave',
                    gps: '37.7758° N, 122.4231° W',
                    trust: 92,
                    status: 'Reported',
                    affected: '148 Citizens',
                    reporter: 'Alex Rivera',
                    date: 'Oct 25, 2023',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLQXeyzGar9v1kQF29pvUPx2g0ufGSbyJpi7vsAOPRMhvbXddYc2c4h8aa5a6LEOehvvmNxnswqW4soaYxUD8U2DPvHgENsrN6V59jH5Iy6gRxs_f0AQoheKwp1yplxkBgF-KhtHqDe29zbSZv1JBixvmXoNWqYXtbt21nLtkdieDzXSYWfehM7dPNl8Rxp2cWXNaxaUoY2Ak2s9TX4riTLBSPZLwTVcoDP8-gcTAF4PBn8iMh2JGgzw36s0siZGCab_pwzXLeowk',
                    analysis: {
                        source: 'seed',
                        confidence: 90,
                        summary: 'AI detected sidewalk damage and a pedestrian hazard.'
                    },
                    timeline: [
                        { status: 'Reported', date: 'Oct 25, 12:00 PM', description: 'Cracked concrete posing safety issues.' }
                    ],
                    comments: []
                },
                {
                    id: '#RU-125',
                    title: 'Park Maintenance',
                    category: 'Public Sanitation',
                    severity: 'Minor',
                    address: 'Central Park East Gate',
                    gps: '37.7812° N, 122.4112° W',
                    trust: 64,
                    status: 'Reported',
                    affected: '52 Citizens',
                    reporter: 'Marcus J.',
                    date: 'Oct 25, 2023',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeV_QVKf3BPh37_HASO01yJtEEmrpxyGwOf7swUJtnsIsq7g3VYV-gvJPh_Z_PFZCVlHYExXDOINQDwt-npQeoaFyg47OS11vwgmamSHrz-xJcZK3iIc5HknHehqD4PmnUuUEb2D4LXrX2tC460xJuQEV8qu8JnL95ggwx-bi1sbf8AvfRu6Veym5yOQoP5EIMpdtRBjYfpEkXmx3ik-kvAIH9g4v5JJFsgj4Xek2Lo3nSsgbkaWaDOu-tRKlPkGlunKn17QHAkq4',
                    analysis: {
                        source: 'seed',
                        confidence: 87,
                        summary: 'AI identified sanitation issues in the park area.',
                        department: 'Parks & Recreation'
                    },
                    timeline: [
                        { status: 'Reported', date: 'Oct 25, 01:10 PM', description: 'Overflowing trash bins near playground.' }
                    ],
                    comments: []
                },
                {
                    id: '#CC-8821',
                    title: 'Major Pothole Repair',
                    category: 'Road Infrastructure',
                    severity: 'Moderate',
                    address: 'West 4th Avenue',
                    gps: '37.7761° N, 122.4201° W',
                    trust: 98,
                    status: 'Pending Resolution Verification',
                    affected: '42 Neighbors',
                    reporter: 'Alex Rivera',
                    date: 'Oct 23, 2023',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7vRv6upoXNuIgwZf7Pmbb8vfSWzPfr88qPXvqAGSqcDInPwncAqBFRyFmbHX-mFKSd8r9thr-XCTBiky4YKJOxR-7bopyL9rytI0mQJf9DDbdMVMPWt5bvgVSo2XSWmwXoy_SIMCeC4g7i5sSWz4e4p8dNRI97ZVrCcleL6N1ICeox8XWnXlPDsSEmR6lit_E93Bm3ZQCSRSyo9W09cbkspOUXS827jNTHiUAUl1GAWKX2UuUJ6EhOeAe6nqTTayHMQBHiKetv0Y',
                    analysis: {
                        source: 'seed',
                        confidence: 98,
                        summary: 'The repair site is ready for community verification.'
                    },
                    timeline: [
                        { status: 'Reported', date: 'Oct 23, 08:00 AM', description: 'Deep pothole report filed.' },
                        { status: 'Verified', date: 'Oct 23, 10:00 AM', description: 'Zonal Engineer approved dispatch.' },
                        { status: 'In Progress', date: 'Oct 24, 09:00 AM', description: 'Crew worked on deep cold-mix sealing.' },
                        { status: 'Resolved Pending Verification', date: 'Oct 24, 05:00 PM', description: 'Maintenance marked resolve.' }
                    ],
                    comments: []
                }
            ],
            activities: []
        };
    }

    loadState() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                return this.migrateState(JSON.parse(stored));
            } catch (error) {
                console.error('Error parsing stored civic state. Resetting.', error);
            }
        }

        const initialState = this.createInitialState();
        localStorage.setItem(this.storageKey, JSON.stringify(initialState));
        return initialState;
    }

    migrateState(state) {
        const defaults = this.createInitialState();
        const merged = {
            ...defaults,
            ...state,
            meta: {
                ...defaults.meta,
                ...(state.meta || {})
            },
            user: {
                ...defaults.user,
                ...(state.user || {}),
                settings: {
                    ...defaults.user.settings,
                    ...((state.user && state.user.settings) || {})
                }
            },
            reports: Array.isArray(state.reports) ? state.reports : defaults.reports,
            activities: Array.isArray(state.activities) ? state.activities : defaults.activities
        };

        if (!merged.meta.schemaVersion || merged.meta.schemaVersion < 2) {
            merged.meta.schemaVersion = 2;
            merged.meta.updatedAt = Date.now();
        }

        return merged;
    }

    save() {
        this.state.meta.updatedAt = Date.now();
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        this.saveToBackend().catch(() => {});
        this.syncUI();
    }

    async hydrateFromBackend() {
        try {
            const response = await fetch(`${this.backendUrl}/api/state`, {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) {
                return;
            }

            const remoteState = await response.json();
            const remoteUpdatedAt = remoteState?.meta?.updatedAt || 0;
            const localUpdatedAt = this.state?.meta?.updatedAt || 0;
            if (remoteUpdatedAt > localUpdatedAt) {
                this.state = this.migrateState(remoteState);
                localStorage.setItem(this.storageKey, JSON.stringify(this.state));
                this.syncUI();
            }
        } catch (error) {
            // Backend sync is optional.
        }
    }

    async saveToBackend() {
        try {
            await fetch(`${this.backendUrl}/api/state`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state)
            });
        } catch (error) {
            // LocalStorage remains the source of truth when the backend is unavailable.
        }
    }

    getLevelProgress() {
        return {
            xpIntoLevel: this.state.user.xp,
            xpPerLevel: this.xpPerLevel,
            percent: Math.min(100, (this.state.user.xp / this.xpPerLevel) * 100),
            remaining: Math.max(0, this.xpPerLevel - this.state.user.xp)
        };
    }

    addXp(amount) {
        this.state.user.xp += amount;
        let leveledUp = false;

        while (this.state.user.xp >= this.xpPerLevel) {
            this.state.user.xp -= this.xpPerLevel;
            this.state.user.level += 1;
            leveledUp = true;
        }

        this.state.user.reputation += Math.max(1, Math.floor(amount / 5));
        this.addActivity('bolt', 'XP Earned', `Earned ${amount} XP from civic activity.`);
        if (leveledUp) {
            this.toast('Level Up!', `You reached Level ${this.state.user.level}.`, 'military_tech');
            this.addActivity('military_tech', `Leveled Up to Level ${this.state.user.level}`, `Reached Level ${this.state.user.level} through community action.`);
        } else {
            this.toast('XP Earned!', `+${amount} XP added to your profile.`, 'bolt');
        }

        this.save();
    }

    addActivity(icon, title, desc) {
        this.state.activities.unshift({
            icon,
            title,
            desc,
            time: 'Just now',
            timestamp: Date.now()
        });
        this.state.activities = this.state.activities.slice(0, 100);
        this.state.meta.updatedAt = Date.now();
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        this.syncUI();
        this.saveToBackend().catch(() => {});
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

    detectIssueFromText(text) {
        const value = String(text || '').toLowerCase();
        const profiles = [
            {
                keywords: ['pothole', 'crack', 'road', 'asphalt', 'sinkhole'],
                category: 'Road Infrastructure',
                severity: 'Moderate',
                department: 'Public Works',
                title: 'Road Surface Damage',
                summary: 'AI detected a roadway surface issue that needs repair.',
                locationLabel: 'Street Surface Issue'
            },
            {
                keywords: ['streetlight', 'light', 'lamp', 'outage', 'power line', 'electrical'],
                category: 'Traffic Safety',
                severity: 'Critical',
                department: 'Public Works',
                title: 'Lighting or Electrical Hazard',
                summary: 'AI detected a lighting or electrical safety issue.',
                locationLabel: 'Street Safety Issue'
            },
            {
                keywords: ['trash', 'garbage', 'waste', 'overflow', 'sanitation', 'sewage'],
                category: 'Public Sanitation',
                severity: 'Moderate',
                department: 'Sanitation',
                title: 'Sanitation Issue',
                summary: 'AI detected a sanitation or waste management issue.',
                locationLabel: 'Sanitation Issue'
            },
            {
                keywords: ['park', 'tree', 'bench', 'playground', 'grass', 'graffiti'],
                category: 'Green Spaces',
                severity: 'Minor',
                department: 'Parks & Recreation',
                title: 'Park Maintenance Issue',
                summary: 'AI detected a parks or public space maintenance issue.',
                locationLabel: 'Public Space Issue'
            },
            {
                keywords: ['traffic', 'sign', 'crosswalk', 'signal', 'pedestrian', 'bike'],
                category: 'Traffic Safety',
                severity: 'Moderate',
                department: 'Public Works',
                title: 'Traffic Safety Issue',
                summary: 'AI detected a traffic and pedestrian safety concern.',
                locationLabel: 'Traffic Issue'
            }
        ];

        const matchedProfile = profiles.find(profile => profile.keywords.some(keyword => value.includes(keyword))) || {
            category: 'Community Spaces',
            severity: 'Minor',
            department: 'Public Works',
            title: 'Community Issue',
            summary: 'AI detected a civic issue and routed it for verification.',
            locationLabel: 'General Issue'
        };

        let confidence = 72;
        if (matchedProfile.category === 'Road Infrastructure') confidence = 96;
        if (matchedProfile.category === 'Traffic Safety') confidence = 91;
        if (matchedProfile.category === 'Public Sanitation') confidence = 88;
        if (matchedProfile.category === 'Green Spaces') confidence = 85;

        return {
            ...matchedProfile,
            confidence
        };
    }

    normalizeIssueAnalysis(payload = {}) {
        const text = `${payload.fileName || ''} ${payload.mimeType || ''} ${payload.textHint || ''}`.toLowerCase();
        const analysis = this.detectIssueFromText(text);
        return {
            source: payload.source || 'heuristic',
            confidence: payload.confidence || analysis.confidence,
            category: payload.category || analysis.category,
            severity: payload.severity || analysis.severity,
            department: payload.department || analysis.department,
            title: payload.title || analysis.title,
            summary: payload.summary || analysis.summary,
            locationLabel: payload.locationLabel || analysis.locationLabel,
            mediaType: payload.mediaType || (payload.file ? payload.file.type : 'image/jpeg')
        };
    }

    async analyzeMedia(file, extraContext = {}) {
        const promptContext = {
            fileName: file?.name || '',
            mimeType: file?.type || '',
            textHint: extraContext.textHint || ''
        };

        const geminiResult = await this.analyzeWithGemini(promptContext).catch(() => null);
        if (geminiResult) {
            return this.normalizeIssueAnalysis({ ...promptContext, ...geminiResult, source: 'gemini' });
        }

        return this.normalizeIssueAnalysis({ ...promptContext, ...extraContext, source: 'heuristic' });
    }

    async analyzeWithGemini(promptContext) {
        const apiKey = localStorage.getItem('gemini_api_key') || window.GEMINI_API_KEY;
        if (!apiKey) {
            return null;
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: [
                                    'Analyze the civic issue in this uploaded media and return strict JSON only.',
                                    'Output keys: category, severity, department, title, summary, confidence, locationLabel.',
                                    'Valid categories: Road Infrastructure, Traffic Safety, Public Sanitation, Green Spaces, Community Spaces, Utilities.',
                                    `File name: ${promptContext.fileName}`,
                                    `Mime type: ${promptContext.mimeType}`,
                                    `Extra context: ${promptContext.textHint || ''}`
                                ].join('\n')
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: 'application/json'
                }
            })
        });

        if (!response.ok) {
            return null;
        }

        const payload = await response.json();
        const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch (error) {
            return null;
        }
    }

    submitReport(reportData) {
        const reportId = this.generateReportId();
        const analysis = this.normalizeIssueAnalysis(reportData.analysis || {});
        const reporterName = reportData.reporter || (this.state.user.settings.anonymous ? 'Anonymous' : this.state.user.name);
        const timestampLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const newReport = {
            id: reportId,
            title: reportData.title || analysis.title,
            category: reportData.category || analysis.category,
            severity: reportData.severity || analysis.severity,
            address: reportData.address || 'Unknown location',
            gps: reportData.gps || 'GPS unavailable',
            trust: typeof reportData.trust === 'number' ? reportData.trust : analysis.confidence,
            status: reportData.status || 'Reported',
            department: reportData.department || analysis.department,
            affected: reportData.affected || '400+ Citizens',
            reporter: reporterName,
            date: reportData.date || timestampLabel,
            mediaType: reportData.mediaType || analysis.mediaType,
            img: reportData.mediaUrl || reportData.img || '',
            analysis,
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
        if (!report) {
            return;
        }

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
        if (!report) {
            return;
        }

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
        if (!report) {
            return;
        }

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

    reopenReport(id, reason = 'Community review requested a reopen.') {
        const report = this.getReportById(id);
        if (!report) {
            return;
        }

        report.status = 'In Progress';
        report.timeline = report.timeline || [];
        report.timeline.push({
            status: 'Reopened',
            date: 'Just now',
            description: reason
        });
        this.addActivity('warning', 'Case Reopened', `${report.title} was reopened for more work.`);
        this.toast('Case Reopened', 'Maintenance team notified.', 'warning');
        this.save();
    }

    markReportResolved(id, finalStatus = 'Resolved') {
        const report = this.getReportById(id);
        if (!report) {
            return;
        }

        report.status = finalStatus;
        report.timeline = report.timeline || [];
        report.timeline.push({
            status: finalStatus,
            date: 'Just now',
            description: 'The issue has been marked resolved.'
        });
        this.addActivity('verified', 'Resolution Confirmed', `${report.title} marked as ${finalStatus}.`);
        this.save();
    }

    toast(title, message, iconName = 'bolt') {
        if (typeof document === 'undefined' || !document.body) {
            return;
        }

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
        if (typeof document === 'undefined') {
            return;
        }

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
            if (!iconElement) {
                return;
            }

            const iconName = iconElement.getAttribute('data-icon') || iconElement.textContent.trim();
            const targetPage = navMap[iconName];
            if (!targetPage) {
                return;
            }

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
            if (label === 'bolt') {
                icon.style.cursor = 'pointer';
                icon.addEventListener('click', event => {
                    event.preventDefault();
                    this.toast('Civic Streak', `You have kept up a ${this.state.user.streak} day streak!`, 'local_fire_department');
                });
            }
        });

        document.querySelectorAll('[data-user-avatar], header .rounded-full').forEach(avatar => {
            avatar.style.cursor = 'pointer';
            avatar.addEventListener('click', event => {
                if (event.target.tagName === 'IMG' || event.target.classList.contains('rounded-full')) {
                    window.location.href = 'profile.html';
                }
            });
        });
    }
}

window.civicController = new CivicStateController();
window.CivicState = window.civicController.state;