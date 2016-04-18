import React, { Component, PropTypes } from 'react';
import reactMixin                      from 'react-mixin';
import Mozaik                          from 'mozaik/browser';
import { ListenerMixin }               from 'reflux';
import c3                              from 'c3';
import _                               from 'lodash';

class SparkTwitterToneBreakdown extends Component{
	constructor(props) {
        super(props);
        
        this.state = {
    		"colData": []
    	};
    }

    getApiRequest() {
    	//console.log("Calling getApiRquest for tone widget");
        return {
            id: 'sparkTwitter.getToneBreakdown',
            params: {
            	topic: "topHashTags.toneScores"
            }
        };
    }

    onApiData(metrics) {
		if (metrics != null && metrics.length > 1) {
			var m = [metrics[0], ["emo"]];
			var emoCnt = metrics[0].length - 1;
			for (var i = 0; i < emoCnt; i++) m[1].push(0);
			_.forEach(metrics.slice(1), function (el) {
				_.forEach(el.slice(1), function (el, i) {
					m[1][i + 1] += el;
				});
			});
			this.setState({"colData": m});
		} else this.setState({"colData": metrics});
    }

    componentDidUpdate() {
    	if ( this.state.colData.length > 0 ){
    		this.chart.load(this.getChartData());
    		this.onResize();
    	}
    }
    
    getChartData(){
    	var retData = {"columns": this.state.colData, "unload":[]};
    	
    	//Unload any columns that is not part of the colData
    	var data = retData.columns;
    	_.forEach( this.chart.data(), function(t){
    		if ( !_.find(data, function(u){
    			return u[0]===t.id;
    		})){
    			retData.unload.push(t.id);
    		}
    	});
    	
    	return retData;
    }
    
    onResize() {
    	if (this.chart) {
    		var parent = document.querySelector(".sparkTwitter-toneBreakDown-chart").parentNode;
    		this.chart.resize({ height: parent.offsetHeight - 50 });
    	}
    }

    componentDidMount() {
      var chartElement = React.findDOMNode(this.refs.chartWrapper);
      this.chart = c3.generate({
    	  bindto: chartElement,
    	  data: {
    		  x:'x',
    		  columns: this.state.colData,
    		  type : 'bar'
    	  },
    	  bar: {
			width: {
			    ratio: 0.5 // this makes bar width 50% of length between ticks
			}
    	  },
    	  axis: {
	        x : {
	            type:'categorized'
	        }
    	  },
    	  legend: {
			  position: 'right',
			  show: false
		  }
      });

      window.addEventListener('resize', this.onResize.bind(this));
      this.onResize();
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.onResize.bind(this));
      if (this.chart) {
        this.chart.destroy();
      }
    }

    render() {
    	return (
    		<div style={{height:'100%'}}>
	    		<div className="chart-title-text">Trending sentiments</div>
	            <div ref="chartWrapper" className="sparkTwitter-toneBreakDown-chart"></div>
	        </div>
        );
  	}
}

reactMixin(SparkTwitterToneBreakdown.prototype, ListenerMixin);
reactMixin(SparkTwitterToneBreakdown.prototype, Mozaik.Mixin.ApiConsumer);
export { SparkTwitterToneBreakdown as default };
