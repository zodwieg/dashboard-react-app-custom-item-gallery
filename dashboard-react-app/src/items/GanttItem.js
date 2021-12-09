import { CustomItemViewer, ResourceManager } from 'devexpress-dashboard/common'
import dxGantt from 'devextreme/ui/gantt'
import notify from "devextreme/ui/notify";

const svgIcon = `<? xml version = "1.0" encoding = "utf-8"?>
    <svg version="1.1" id="ganttItemIcon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">
        <path class="dx-dashboard-contrast-icon" d="M23,2c0-0.6-0.4-1-1-1H2C1.4,1,1,1.4,1,2v20c0,0.6,0.4,1,1,1h20c0.6,0,1-0.4,1-1 V2z M21,21H3V3h18V21z"/>
        <path class="dx-dashboard-accent-icon" d="M12,9H5V5h7V9z M19,10H9v4h10V10z M15,15H7v4h8V15z"/>
    </svg>`;
const ganttItemMetadata = {
    bindings: [{
        propertyName: 'ID',
        dataItemType: 'Dimension',
        displayName: 'ID',
        enableInteractivity: true
    }, {
        propertyName: 'ParentID',
        dataItemType: 'Dimension',
        displayName: 'Parent ID',
        enableInteractivity: true
    }, {
        propertyName: 'Text',
        dataItemType: 'Dimension',
        displayName: 'Text',
        enableInteractivity: true
    }, {
        propertyName: 'StartDate',
        dataItemType: 'Dimension',
        displayName: 'Start Date',
        enableInteractivity: true
    }, {
        propertyName: 'FinishDate',
        dataItemType: 'Dimension',
        displayName: 'Finish Date',
        enableInteractivity: true
    }],
    interactivity: {
        filter: true
    },
    icon: 'ganttItemIcon',
    title: 'Gantt Chart',
    index: 0
};


class GanttItemViewer extends CustomItemViewer {
	constructor(model, $container, options) {		
        super(model, $container, options);
        this.dxGanttWidget = null;
	}

    _getDataSource() {
        let data = [];
        let datesValid = true;

        this.iterateData(function (dataRow) {
            data.push({
                id: dataRow.getValue('ID')[0],
                parentId: dataRow.getValue('ParentID')[0],
                title: dataRow.getValue('Text')[0],
                start: dataRow.getValue('StartDate')[0],
                end: dataRow.getValue('FinishDate')[0],
                clientDataRow: dataRow
            });

            let currentItem = data[data.length - 1];
         
            if ((currentItem.start && !(currentItem.start instanceof Date)) || (currentItem.end && !(currentItem.end instanceof Date)))
                datesValid = false;
        });

        if (!datesValid) {
            notify("Gantt: 'Start Date' or 'Finish Date' is not a Date object.", "warning", 3000);
            return [];
        }

        return data;
    };
    
    _getDxGanttWidgetSettings() {
        return {
            rootValue: -1,
            tasks: {
                dataSource: this._getDataSource()
            },
            columns: [{
                dataField: "title",
                caption: "Subject",
                width: 300,
            }, {
                dataField: "start",
                caption: "Start Date"
            }, {
                dataField: "end",
                caption: "End Date"
            }],
            onTaskClick: e => {
                var tasks = e.component.option("tasks.dataSource");
                var clickedTask = tasks.filter(item => item.id === e.key)[0];

                this.setMasterFilter(clickedTask.clientDataRow);
            },
            scaleType: "days",
            taskListWidth: 500,
        };
    };
    setSelection(values) {
        super.setSelection.call(this, values);
        let tasks = this.dxGanttWidget.option("tasks.dataSource");

        tasks.forEach(item => {
            if (this.isSelected(item.clientDataRow))
                this.dxGanttWidget.option("selectedRowKey", item.id);
        });
    };

    clearSelection() {
        super.clearSelection.call(this);
        this.dxGanttWidget.option("selectedRowKey", null);
    };

    setSize(width, height) {
        super.setSize.call(this, width, height);
        this.dxGanttWidget.repaint();
    };

    renderContent(element, changeExisting) {
        if (!changeExisting) {
            while (element.firstChild)
                element.removeChild(element.firstChild);
            this.dxGanttWidget = new dxGantt(element, this._getDxGanttWidgetSettings());
        } else {
            this.dxGanttWidget.option(this._getDxGanttWidgetSettings());
        }
    };
}

class GanttItem {
    constructor(dashboardControl) {
        ResourceManager.registerIcon(svgIcon);    
        this.name = "ganttItem";
        this.metaData = ganttItemMetadata;
    }

    createViewerItem(model, $element, content) {
        return new GanttItemViewer(model, $element, content);
    }
}

export default GanttItem;