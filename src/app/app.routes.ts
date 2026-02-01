import { Routes } from '@angular/router';
import { Home } from './component/shared/home/home';
import { ArticuloPlistAdminRouted } from './component/articulo/plist-admin-routed/articulo-plist';
import { PartidoPlistAdminRouted } from './component/partido/plist-admin-routed/partido-plist';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'articulo', component: ArticuloPlistAdminRouted},
    { path: 'articulo/:tipoarticulo', component: ArticuloPlistAdminRouted},    
    { path: 'partido', component: PartidoPlistAdminRouted},
    { path: 'partido/:id_liga', component: PartidoPlistAdminRouted}
];
