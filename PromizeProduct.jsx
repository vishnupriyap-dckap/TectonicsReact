const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
];

class PromizeProduct extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectArray: [],
            selectedOptions:{}
        }
        this._onButtonClick = this._onButtonClick.bind(this);
    }
    componentDidMount() {
        this.setState({ selectArray: this.props.customizeAttribute.promize_tabs,selectedOptions:this.props.selectedOptions });
    }
    handleSizeChange(e) {
        if (e.target.value) {

        }
    }
    renderSelect = (options) => {
        var selectedOption;
        options.promize_tab_attributes[0].promize_tab_attribute_values.filter((item) => {
            if (item.is_default_option == 1) {
                selectedOption = item.promize_attribute_value.option_code;
            }
        });
        return (
            <div className="size-option">
                <label> {options && options.tab_name}</label>
                <br />
                <div className="select">
                    <select value={selectedOption} onChange={e => this.handleSizeChange(e)}>
                        <option value="">Select option</option>
                        {options.promize_tab_attributes[0].promize_tab_attribute_values && options.promize_tab_attributes[0].promize_tab_attribute_values.map((data, index) => {
                            return <option value={data.promize_attribute_value.option_code}>{data.promize_attribute_value.option_name}</option>
                        })}
                    </select>
                </div>
                <br />
            </div>
        )
    }
    _onButtonClick(value) {
        const selectedOptions = Object.assign({},this.state.selectedOptions)
        var defaultOptions = [];
        if(Object.keys(value).length > 0){
            selectedOptions[value.promize_tab_attribute_id] = value.promize_attribute_value.promize_attribute_values_id;
             defaultOptions = this.props.defaultOptions.filter((data)=>{
                if(data.promize_tab_attribute_id != value.promize_tab_attribute_id){
                    return data;
                }
            })
            defaultOptions.push(value);
        }
        this.props.handleStateFromChild(defaultOptions,selectedOptions);
        this.setState({selectedOptions});
    }
    renderElements(elm, value) {
        switch (elm) {
            case 1:
                return this.renderButtonGroup(value);
            case 5:
                return this.renderSelect(value)
            default:
                console.log(value);
                break;
        }
    }
    renderButton = (buttonArray) => {
        return buttonArray[0].promize_tab_attribute_values && buttonArray[0].promize_tab_attribute_values.map(function (button, i) {
            const className = this.state.selectedOptions[button.promize_tab_attribute_id] == button.promize_attribute_values_id  ? "open" : "closed";
            // const className = this.props.selectedOption[button.promize_tab_attribute_id] == 
            return (
                <button key={i} className={className} onClick={e => this._onButtonClick(button)}>{button.promize_attribute_value.option_name}</button>
            )
        }, this)
    }
    renderButtonGroup(buttonArray) {
        return (
            <div className="bottom-option">
                <h6>{buttonArray.tab_name}</h6>
                {this.renderButton(buttonArray.promize_tab_attributes)}
            </div>
        )
    }
    render() {
        return (
            <div className="product-information">
                <div className="product-info-title">
                    <h4>{this.props.product.promize_customizer_name && this.props.product.promize_customizer_name}</h4>
                    <p>Product id:{this.props.product.promize_customizer_id && this.props.product.promize_customizer_id}</p>
                </div>
                <div className="secondary-product-info">
                    <div className="">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut </p>
                    </div>
                    {this.state.selectArray && this.state.selectArray.map((item, i) => {
                        if (item.promize_tab_attributes.length > 0) {
                            var attribute_type = item.tab_style && item.tab_style ? JSON.parse(item.tab_style).display : null;
                            return this.renderElements(attribute_type, item);
                        }
                    })}
                </div>
                <div className="quantity">
                    <div className="values">
                        <label>Qty:</label>
                        <input type="" name="" />
                        <p>Estimated cost:9999</p>
                    </div>
                    <div className="download-template">
                        <button className="upload download-temp">Download Template</button>
                        <p>Ready to upload?</p>
                    </div>
                </div>
            </div>
        )
    }
}
