import { AppPage } from './app.base';

export abstract class AppList extends AppPage {

    page: number = 1;
    totalItems: number = 10;
    numberToShow: number[] = [3, 15, 30, 50];
    pageSize: number = this.numberToShow[1];
    maxSize: number = 5;

    sort: string = null;
    order: any = false;
    keyword: string = '';

    requestList: any = null;
    requestSort: any = null;
    requestSearch: any = null;

    dataSearch: any = {};

    // * header table.
    right: CommonType.DIRECTION = 'right';
    left: CommonType.DIRECTION = 'left';

    headers: CommonInterface.IHeaderTable[];
    configSearch: CommonInterface.IConfigSearchOption;

    constructor() {
        super();
    }

    setSortBy(sort?: string, order?: boolean): void {
        this.sort = sort ? sort : 'code';
        this.order = order;
    }

    sortBy(sort: string): void {
        if (!!sort) {
            this.setSortBy(sort, this.sort !== sort ? true : !this.order);

            if (typeof (this.requestSort) === 'function') {
                // this.requestList(this.sort, this.order);   // sort server
                this.requestSort(this.sort, this.order);   // sort Local
            }
        }
    }

    sortClass(sort: string): string {
        if (!!sort) {
            let classes = 'sortable ';
            if (this.sort === sort) {
                classes += ('sort-' + (this.order ? 'asc' : 'desc') + ' ');
            }

            return classes;
        }
        return '';
    }

    pageChanged(event: any): void {
        if (this.page !== event.page || this.pageSize !== event.itemsPerPage) {
            this.page = event.page;
            this.pageSize = event.itemsPerPage;

            this.requestList();
        }
    }

    selectPageSize(pageSize: number, data?: any) {
        this.pageSize = pageSize;
        this.page = 1;  // TODO reset page to initial
        this.totalItems = 0;
        this.requestList(data);
    }

    onSearch($event) {
        this.requestSearch($event);
    }

}
