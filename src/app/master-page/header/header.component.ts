import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event } from '@angular/router';
import { SystemRepo } from '@repositories';

import { SystemConstants } from 'src/constants/system.const';
import { Office } from 'src/app/shared/models';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, AfterViewInit {

    @Output() officeChange: EventEmitter<Office> = new EventEmitter<Office>();
    @Output() groupDepartmentChange: EventEmitter<SystemInterface.IDepartmentGroup> = new EventEmitter<SystemInterface.IDepartmentGroup>();


    english_flag = "assets/app/media/img/lang/en.png";
    vietnam_flag = "assets/app/media/img/lang/vi.png";
    active_flag = "assets/app/media/img/lang/en.png";

    currenUser: SystemInterface.IClaimUser;

    offices: Office[];
    selectedOffice: Office;

    departmentGroups: SystemInterface.IDepartmentGroup[] = [];
    selectedDepartmentGroup: SystemInterface.IDepartmentGroup;
    pageTitle: string = 'Home';

    constructor(
        private router: Router,
        private _systemRepo: SystemRepo,
        private _activedRouter: ActivatedRoute,
    ) { }

    ngOnInit() {
        // this._store.select(getClaimUserOfficeState).subscribe((res: any) => {
        //     if (!!res) {
        //         this.selectedOffice = this.offices.find(o => o.id === res);
        //     }
        // });

        // this._store.select(getClaimUserDepartGrouptate).subscribe((res: any) => {
        //     if (!!res && res.departmentId && res.groupId) {
        //         this.selectedDepartmentGroup = this.departmentGroups.find(d => d.departmentId === res.departmentId && d.groupId === res.groupId);
        //     }
        // });

        this.currenUser = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        if (!!this.currenUser) {
            this.getOfficeDepartGroupCurrentUser(this.currenUser);
        }

        this.router.events.subscribe((event: Event) => {
            switch (true) {
                case event instanceof NavigationEnd:
                    const data = this.createBreadcrumbs(this._activedRouter.root);
                    if (!!data.length && data.length > 2) {
                        this.pageTitle = data[2].name;
                    } else {
                        this.pageTitle = "Home";
                    }
                    break;
                case event instanceof NavigationStart:
                case event instanceof NavigationCancel:
                case event instanceof NavigationError: {
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }

    getOfficeDepartGroupCurrentUser(currenUser: SystemInterface.IClaimUser) {
        forkJoin([
            this._systemRepo.getOfficePermission(currenUser.id, currenUser.companyId),
            this._systemRepo.getDepartmentGroupPermission(currenUser.id, currenUser.officeId)
        ]).pipe(tap((res: any) => {
            this.offices = res[0] || [];
            if (!!this.offices.length) {
                if (this.offices.length === 1) {
                    this.selectedOffice = this.offices[0];
                } else {
                    this.selectedOffice = this.offices.find(o => o.id === currenUser.officeId);
                }

                // * SAVE USER LOGGED OFFICE'S 
                localStorage.setItem(SystemConstants.CURRENT_OFFICE, this.selectedOffice.branchNameEn);
            }
        })).subscribe((res: any) => {
            if (!!res) {
                this.departmentGroups = res[1] || [];
                if (!!this.departmentGroups.length) {
                    if (this.departmentGroups.length === 1) {
                        this.selectedDepartmentGroup = this.departmentGroups[0];
                    } else {
                        this.selectedDepartmentGroup = this.departmentGroups.find(d => d.departmentId === +currenUser.departmentId && d.groupId === +currenUser.groupId);
                    }
                }
            }
        });
    }

    createBreadcrumbs(route: ActivatedRoute, path: string = '', breadcrumbs: any[] = []): any[] {
        const children: ActivatedRoute[] = route.children;

        if (children.length === 0) {
            return breadcrumbs;
        }

        for (const child of children) {
            const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
            if (routeURL !== '') {
                path += decodeURI(`/${routeURL}`);
            }

            const label = child.snapshot.data['name'];
            if (!!(label)) {
                breadcrumbs.push({
                    name: label,
                    path: path
                });
            }
            return this.createBreadcrumbs(child, path, breadcrumbs);
        }
    }

    changeOffice(office: Office) {
        if (!!office && this.offices.length > 1) {
            this.officeChange.emit(office);
        }
    }

    changeDepartmentGroup(departmentGroup: SystemInterface.IDepartmentGroup) {
        if (!!departmentGroup && this.departmentGroups.length > 1) {
            this.groupDepartmentChange.emit(departmentGroup);
        }
    }

    getCurrentLangFromUrl() {
        const url = window.location.href;
        const host = window.location.hostname;
        const url_arr = url.split("/");
        const current_lang_index = url_arr.indexOf(host) + 1;
        return url_arr[current_lang_index];
    }

    ngAfterViewInit(): void {
        if (this.getCurrentLangFromUrl() === "en") {
            this.active_flag = this.english_flag;
            localStorage.setItem(SystemConstants.CURRENT_CLIENT_LANGUAGE, "en");
            localStorage.setItem(SystemConstants.CURRENT_LANGUAGE, "en-US");
        }
        if (this.getCurrentLangFromUrl() === "vi") {
            this.active_flag = this.vietnam_flag;
            localStorage.setItem(SystemConstants.CURRENT_CLIENT_LANGUAGE, "vi");
            localStorage.setItem(SystemConstants.CURRENT_LANGUAGE, "vi-VN");
        }
    }

    changeLanguage(lang: string) {
        if (lang === localStorage.getItem(SystemConstants.CURRENT_CLIENT_LANGUAGE)) {
            return;
        } else {
            if (lang === "en") {
                localStorage.setItem(SystemConstants.CURRENT_CLIENT_LANGUAGE, SystemConstants.LANGUAGES.ENGLISH);
                localStorage.setItem(SystemConstants.CURRENT_LANGUAGE, SystemConstants.LANGUAGES.ENGLISH_API);
                localStorage.setItem(SystemConstants.CURRENT_LANGUAGE, "en-US");
                const url = window.location.protocol + "//" + window.location.hostname + "/" + lang + "/#" + this.router.url + "/";
                this.active_flag = this.english_flag;
                window.location.href = url;
            }
            if (lang === "vi") {
                localStorage.setItem(SystemConstants.CURRENT_CLIENT_LANGUAGE, SystemConstants.LANGUAGES.VIETNAM);
                localStorage.setItem(SystemConstants.CURRENT_LANGUAGE, SystemConstants.LANGUAGES.VIETNAM_API);
                localStorage.setItem(SystemConstants.CURRENT_LANGUAGE, "vi-VN");
                const url = window.location.protocol + "//" + window.location.hostname + "/" + lang + "/#" + this.router.url + "/";
                this.active_flag = this.vietnam_flag;
                window.location.href = url;
            }
        }
    }


    // minimize sidebar
    minimize_page_sidebar() {
        const bodyElement = document.getElementById('bodyElement');
        const leftMinimizeToggle = document.getElementById('m_aside_left_minimize_toggle');
        if (leftMinimizeToggle.classList.contains('m-brand__toggler--active')) {
            bodyElement.classList.remove('m-brand--minimize', 'm-aside-left--minimize');
            leftMinimizeToggle.classList.remove('m-brand__toggler--active');
        } else {
            bodyElement.classList.add('m-brand--minimize', 'm-aside-left--minimize');
            leftMinimizeToggle.classList.add('m-brand__toggler--active');
        }
    }
}


