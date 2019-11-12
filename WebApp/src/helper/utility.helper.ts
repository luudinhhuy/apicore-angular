export class UtilityHelper {
    prepareNg2SelectData(dataSource: any[], id: any, text: any) {
        return dataSource.map((item: any) => {
            return { id: item[id], text: item[text] }
        });
    }


    calculateTotalAmountWithVat(vat: number, quantity: number, unitPrice: number): number {
        let total = 0;
        if (vat >= 0) {
            total = quantity * unitPrice * (1 + (vat / 100));
        } else {
            total = quantity * unitPrice + Math.abs(vat);
        }
        total = Number(total.toFixed(2));
        return total;
    }

    checkDuplicateInObject(propertyName: string | number, inputArray: { map: (arg0: (item: any) => void) => void; }) {
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
}
