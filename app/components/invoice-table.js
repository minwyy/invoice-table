import Component from '@glimmer/component';
import { action, computed } from '@ember/object';

export default class InvoiceTableComponent extends Component {
    showSortIndicator= true;
    showResizeHandle= true;

    @action
    changeSortIndicator () {
        this.showSortIndicator = !this.showSortIndicator 
    };

    @action
    changeResizeHandler () {
        this.showResizeHandle = !this.showResizeHandle
    };

    @computed
    get columns() {
        return [
            { name: 'A', valuePath: 'A', isFixed: 'left'},
            { name: 'B', valuePath: 'B'},
            { name: 'C', valuePath: 'C'},
            { name: 'D', valuePath: 'D'},
            { name: 'E', valuePath: 'E'},
        ];
      };
    
    @computed
    get rows() {
        return [
            {A: "1", B: "ab", C: "ab", D: "cd", E: "de"},
            {A: "1", B: "ab", C: "ab", D: "cd", E: "de"}
        ];
    }

}
