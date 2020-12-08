import { SystemConstants } from "src/constants/system.const";

export class UtilityHelper {
    prepareNg2SelectData(dataSource: any[], id: any, text: any): CommonInterface.INg2Select[] {
        return dataSource.map((item: any) => {
            return { id: item[id], text: item[text] };
        });
    }


    calculateTotalAmountWithVat(vat: number, quantity: number, unitPrice: number): number {
        let total = 0;
        if (vat >= 0) {
            total = quantity * unitPrice * (1 + (vat / 100));
        } else {
            total = quantity * unitPrice + Math.abs(vat);
        }
        total = Number(total.toFixed(3));
        return total;
    }

    checkDuplicateInObject(propertyName: string | number, inputArray: { map: (arg0: (item: any) => void) => void; }): boolean {
        let seenDuplicate = false;
        const testObject = {};

        inputArray.map(function (item: { [x: string]: any; duplicate: boolean; }) {
            const itemPropertyName = item[propertyName];
            if (!!itemPropertyName && itemPropertyName in testObject) {
                testObject[itemPropertyName].duplicate = true;
                item.duplicate = true;
                seenDuplicate = true;
            } else {
                testObject[itemPropertyName] = item;
                delete item.duplicate;
            }
        });

        return seenDuplicate;
    }

    calculateHeightWeight(width: number, height: number, length: number, packg: number, hwConstant: number) {
        return +((width * height * length / hwConstant) * packg).toFixed(3);
    }

    calculateCBM(width: number, height: number, length: number, packg: number, hwConstant: number) {
        return +((width * height * length / hwConstant / SystemConstants.CBM_AIR_CONSTANT) * packg).toFixed(3);
    }

    convertNumberToWords(amount: number | string) {
        const words = new Array();
        words[0] = '';
        words[1] = 'One';
        words[2] = 'Two';
        words[3] = 'Three';
        words[4] = 'Four';
        words[5] = 'Five';
        words[6] = 'Six';
        words[7] = 'Seven';
        words[8] = 'Eight';
        words[9] = 'Nine';
        words[10] = 'Ten';
        words[11] = 'Eleven';
        words[12] = 'Twelve';
        words[13] = 'Thirteen';
        words[14] = 'Fourteen';
        words[15] = 'Fifteen';
        words[16] = 'Sixteen';
        words[17] = 'Seventeen';
        words[18] = 'Eighteen';
        words[19] = 'Nineteen';
        words[20] = 'Twenty';
        words[30] = 'Thirty';
        words[40] = 'Forty';
        words[50] = 'Fifty';
        words[60] = 'Sixty';
        words[70] = 'Seventy';
        words[80] = 'Eighty';
        words[90] = 'Ninety';
        // tslint:disable: triple-equals

        amount = amount.toString();
        const atemp = amount.split(".");
        const number = atemp[0].split(",").join("");
        const n_length = number.length;
        let words_string = "";
        if (n_length <= 9) {
            const n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
            const received_n_array = new Array();
            for (let i = 0; i < n_length; i++) {
                received_n_array[i] = number.substr(i, 1);
            }
            for (let i = 9 - n_length, j = 0; i < 9; i++ , j++) {
                n_array[i] = received_n_array[j];
            }
            for (let i = 0, j = 1; i < 9; i++ , j++) {
                if (i == 0 || i == 2 || i == 4 || i == 7) {
                    if (n_array[i] == 1) {
                        // tslint:disable-next-line: radix
                        n_array[j] = 10 + parseInt(n_array[j].toString());
                        n_array[i] = 0;
                    }
                }
            }
            let value: any = "";
            for (let i = 0; i < 9; i++) {
                if (i == 0 || i == 2 || i == 4 || i == 7) {
                    value = n_array[i] * 10;
                } else {
                    value = n_array[i];
                }
                if (value != 0) {
                    words_string += words[value] + " ";
                }
                if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
                    words_string += "Crores ";
                }
                if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
                    words_string += "Lakhs ";
                }
                if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
                    words_string += "Thousand ";
                }
                if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
                    words_string += "Hundred and ";
                } else if (i == 6 && value != 0) {
                    words_string += "Hundred ";
                }
            }
            words_string = words_string.split("  ").join(" ");
        }
        return words_string;
    }
}
