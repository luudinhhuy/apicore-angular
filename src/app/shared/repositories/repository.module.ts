import { NgModule } from '@angular/core';
import { CatalogueRepo, AccountingRepo, OperationRepo, SystemRepo, DocumentationRepo, ExportRepo, SettingRepo } from '.';
import { API_MENU } from 'src/constants/api-menu.const';

@NgModule({
    providers: [
        SystemRepo,
        AccountingRepo,
        OperationRepo,
        CatalogueRepo,
        DocumentationRepo,
        ExportRepo,
        SettingRepo,
        API_MENU
    ],
})
export class RepositoryModule {
}
