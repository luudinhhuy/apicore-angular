import { NgModule } from "@angular/core";
import { LAZY_MODULES_MAP, ILazyModules } from "src/app/load-module-map";

export const lazyModulesFClMap: ILazyModules = {
    SeaFCLImport_cdNote: () => import('./detail-job/cd-note/sea-fcl-import-cd-note.module').then(m => m.SeaFCLImportCDNoteModule),
    SeaFCLImport_assignment: () => import('./detail-job/asignment/sea-fcl-import-asignment.module').then(m => m.SeaFCLImportAsignmentModule)
};

@NgModule({
    providers: [
        {
            provide: LAZY_MODULES_MAP,
            useFactory: () => lazyModulesFClMap
        }
    ]
})
export class SeaFCLImportLazyLoadModule { }
