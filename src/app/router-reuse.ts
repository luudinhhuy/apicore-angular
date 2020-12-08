import {
    RouteReuseStrategy,
    ActivatedRouteSnapshot,
    DetachedRouteHandle,
} from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {

    private handlers: { [key: string]: DetachedRouteHandle } = {};
    /* 
    shouldReuseRoute() => False 
    -> shouldDetach() => True 
    -> store() 
    -> shouldAttach() => True 
    -> retrieve()

    **/
    shouldDetach(route: ActivatedRouteSnapshot): boolean {

        if (!route.routeConfig || route.routeConfig.loadChildren) {
            return false;
        }

        // *  Whether this route should be re used or not */
        let shouldReuse = false;
        if (route.routeConfig.data) {
            route.routeConfig.data.reuse ? shouldReuse = true : shouldReuse = false;
        }

        return shouldReuse;
    }

    store(route: ActivatedRouteSnapshot, handler: DetachedRouteHandle): void {
        if (!route.routeConfig) {
            return;
        }

        if (route.routeConfig.loadChildren) {
            return;
        }
        if (route.routeConfig.data && route.routeConfig.data.reuse) {
            if (handler) {
                this.handlers[this.getUrl(route)] = handler;
            }
        }
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        // return !!this.handlers[this.getUrl(route)];

        if (!route.routeConfig) { return false; }
        if (route.routeConfig.loadChildren) { return false; }
        if (route.routeConfig.data && route.routeConfig.data.reuse) {
            return !!this.handlers[this.getUrl(route)];
        }

        return false;
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        if (!route.routeConfig || route.routeConfig.loadChildren) {
            return null;
        };
        if (route.routeConfig.data && route.routeConfig.data.reuse) {
            return this.handlers[this.getUrl(route)];
        }
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
        // /** We only want to reuse the route if the data of the route config contains a reuse true boolean */
        let reUseUrl = false;

        if (future.routeConfig) {
            if (future.routeConfig.data) {
                reUseUrl = future.routeConfig.data.reuse;
            }
        }

        /**
         * Default reuse strategy by angular assers based on the following condition
         * @see https://github.com/angular/angular/blob/4.4.6/packages/router/src/route_reuse_strategy.ts#L67
         */
        const defaultReuse = (future.routeConfig === current.routeConfig);

        // If either of our reuseUrl and default Url are true, we want to reuse the route
        //

        return (reUseUrl || defaultReuse);
    }

    getUrl(route: ActivatedRouteSnapshot): string {
        /** The url we are going to return */
        if (route.routeConfig) {
            // const url = route.routeConfig.path;
            // return route.url.join("/") || route.parent.url.join("/");
            // return url;
            return this.getResolvedUrl(route);

        }
    }

    getResolvedUrl(route: ActivatedRouteSnapshot): string {
        return route.pathFromRoot
            .map(v => v.url.map(segment => segment.toString()).join('/'))
            .join('/');
    }
}
