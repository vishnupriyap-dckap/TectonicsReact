
const modelUrl = {};
class PromizeWrapper extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         showVarients: false,
         showContainer: false,
         attributes: {},
         attribute_values: {},
         attribute_images: {},
         cliparts_categories: {},
         cliparts_images: {},
         product: {},
         threeD_models: {},
         threeD_settinngs: {},
         defaultOptions: [],
         selectedOptions: {},
         modelOptions:[],
      };
      this.getData = this.getData.bind(this);
      this._onButtonClick = this._onButtonClick.bind(this);
      this.handleStateFromChild = this.handleStateFromChild.bind(this);
   }
   componentDidMount() {
      this.getData();
   }
   getData() {
      fetch('https://devcloud.productimize.com/v3/promizenode/get3DProductDetail', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({ "product_id": 5 }),
      }).then((res) => { return res.json(); })
         .then((data) => {
            this.setState({
               product: data.product,
               showContainer: true,
               customizeAttribute: {},
            }, () => {
               this.setDefaultOptions()
            })
         });
   }
   _onButtonClick(attribute) {
      this.setState({ customizeAttribute: attribute, showVarients: true })
   }
   loadOptions() {
      const promizeSections = this.state.product.promize_customizer.promize_sections;
      return (
         <div className="product-information">
            <div className="product-info-title">
               <h4>{this.state.product.promize_customizer && this.state.product.promize_customizer.promize_customizer_name}</h4>
               <p>Product id:{this.state.product.promize_customizer_id && this.state.product.promize_customizer_id}</p>
            </div>
            <div className="primary-product-option">
               {promizeSections && promizeSections.map((item, i) => {
                  return (
                     <div className="option-1" key={item.promize_section_id}>
                        <h6 key={item.promize_customizer_id}>Select product options and download template</h6>
                        <button key={i} className="upload" onClick={e => this._onButtonClick(item)}>{item.section_name}</button>
                     </div>
                  )
               })}
            </div>
         </div>
      )
   }
   setDefaultOptions() {
      if (Object.keys(this.state.product).length > 0) {
         const defaultOptions = [];
         const selectedOptions = {};
         const modelOptions = [];
         this.state.product.promize_customizer.promize_sections.map((data, i) => {
            return data.promize_tabs.map((item, index) => {
               return item.promize_tab_attributes[0] && item.promize_tab_attributes[0].promize_tab_attribute_values.map((value, i) => {
                  if (value.is_default_option == 1 && value.link_model_attributes != null) {
                     var obj = {[value.promize_tab_attribute_id]:value.link_model_attributes}; 
                     modelOptions.push(obj);
                     selectedOptions[value.promize_tab_attribute_id] = value.promize_attribute_value.promize_attribute_values_id;
                     defaultOptions.push(value);
                     return value;
                  }
               })
            })
         });
         this.state.product.promize_customizer.promize_product_3d_model_categories.map((item,index)=>{
             item.promize_domain_3d_model_categories.map((data,i)=>{
                data.promize_domain_3d_model_images.filter((value)=>{
                    if(data.promize_domain_3d_model_category_id == value.promize_domain_3d_model_category_id){
                        modelUrl[value.promize_domain_3d_model_images_id] = value.model_url;
                    }
               });
            })
         })
         console.log(modelUrl);
         this.setState({defaultOptions,selectedOptions,modelOptions})
      }
   }
   handleStateFromChild(defaultOptions, selectedOptions){

      console.log(defaultOptions, selectedOptions,this.state.modelOptions);
   }
   renderContainer() {
      return (
         <div className="wrapper">
            <PromizeImageSection {...this.state} modelUrl={modelUrl}/>
            <div className="right-section">
               {!(this.state.showVarients) ? this.loadOptions() : null}
               {this.state.showVarients ? <PromizeProduct {...this.state} setDefaultOptions={this.setDefaultOptions} handleStateFromChild={this.handleStateFromChild}/> : null}
            </div>
         </div>
      )
   }
   render() {
      return (
         <div className="container">
            {this.state.showContainer ? this.renderContainer() : null}
         </div>
      )
   }
}
ReactDOM.render(<PromizeWrapper />, document.getElementById('root'));