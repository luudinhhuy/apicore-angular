
//
//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  - \.;\ _ /;./ -  : | |
//         \  \ _.   \_ __\ /__ _/   .- /  /
//     =====-.____.___ \_____/___.-`___.-'=====
//                       `=---='
//
//
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//               GOD BLESS US - NO BUG
// Thấy ngài thì vái 3 vái - thành tâm nhé 
//

import { Component, OnInit} from '@angular/core';
import { BaseService } from 'src/services-base/base.service';
import { Router} from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  ngOnInit(): void {   
    document.body.style.zoom = "100%"
    if(!this.baseService.checkLoginSession(false)){
      this.router.navigateByUrl('/login');
    }
  }

  constructor(private baseService:BaseService, private router:Router) {
  }


}
