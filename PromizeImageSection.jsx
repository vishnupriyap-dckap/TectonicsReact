let downloadedModel = {};
let modelRendred = false;
class PromizeImageSection extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            modelRendred:false,
        }
    }
    componentDidMount() {
        // window.addEventListener('resize', this.handleWindowResize);
    }
    sceneSetup = () => {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, 
            width / height, 
            0.1, 
            1000 
        );
        this.camera.position.z = 9; 
        const objectStateContainer = new THREE.Group()
        objectStateContainer.name = 'objectStateContainer'
        this.scene.add(objectStateContainer)
        this.controls = new THREE.OrbitControls( this.camera, this.mount );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( width, height );
        this.mount.appendChild( this.renderer.domElement ); 
    };
    async addCustomSceneObjects(baseURL) {
        // const geometry = new THREE.BoxGeometry(2, 2, 2);
        // const material = new THREE.MeshPhongMaterial( {
        //     color: 0x156289,
        //     emissive: 0x072534,
        //     side: THREE.DoubleSide,
        //     flatShading: true
        // } );
        // this.cube = new THREE.Mesh( geometry, material );
        // this.scene.add( this.cube );

        const light = new THREE.AmbientLight( 0xcfcfcf );
        this.scene.add( light );

        let hdri = await this.InitHdri('https://devcloud.productimize.com/cms/wp-content/themes/salient-child/View360/three_js_multi_fabric_multi_object_2/projects/_global_assets_/assets_3d/high_quality/hdri_images/sphere_mapping/studio015small.jpg')

        let model = await this.DownloadModelGltf(baseURL)

        model.traverse(
            (child) => {
                if (child.isMesh) {
                    /* values for changing the image encoding. Linear = 3000, sRGB = 3001, RGBE = 3002, LogLuv = 3003 */
                    if(child.material.userData.envMapNeeded)
                        child.material.envMap = hdri
                }
            }
        )
        this.scene.add( model )
    };
    /* download model */
    DownloadModelGltf = (modelUrl) => {
        return new Promise((resolve, reject) => {
            /* init gltf loader */
            let loader = new THREE.GLTFLoader()
            loader.load(modelUrl,
                (gltf) => {
                    resolve(gltf.scene)
                },
                (loading) => {
                    /* model load progress */
                    let loadProgress = Math.floor(loading.loaded / loading.total * 100)
                },
                (error) => {
                    reject(`Unable to load the 3d model ${error}`)
                }
            )
        })
    }
    /* load hdri texture for material reflections */
    InitHdri = (url) => {
        return new Promise((resolve, reject) => {
            let textureLoader = new THREE.TextureLoader()
            let hdri = textureLoader.load(url,
                (loader) => {
                    loader.mapping = THREE.SphericalReflectionMapping
                    loader.encoding = THREE.sRGBEncoding
                    resolve(loader)
                },
                undefined,
                (error) => {
                    reject(`Unable to load the hdri map ${error}`)
                }
            )
        })
    }
    startAnimationLoop = () => {
        this.renderer.render( this.scene, this.camera );
        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    };
  
 initThreeCanvas(){
    if(!modelRendred){
        this.sceneSetup();
        this.startAnimationLoop();
        const light = new THREE.AmbientLight( 0xcfcfcf );
        this.scene.add( light );
        modelRendred = true;
        // this.setState({modelRendred:true})   
    }
    let objectStateContainer = this.scene.getObjectByName('objectStateContainer')
    this.props.modelOptions && this.props.modelOptions.map((defaultOption) => {
        // console.log(defaultOption)
        for (let tabAttributeId in defaultOption){
            if(defaultOption.hasOwnProperty(tabAttributeId)){
                let modelsData = JSON.parse(defaultOption[tabAttributeId])
                modelsData &&  modelsData.map( async function(model){
                    // downloadedModel[model.id] = this.props.modelUrl[model.id];
                    if(downloadedModel[model.id]){
                        if(objectStateContainer[tabAttributeId] && objectStateContainer[tabAttributeId].idTab === downloadedModel[model.id].idTab) {
                            objectStateContainer[tabAttributeId].visible = false
                            objectStateContainer[tabAttributeId] = downloadedModel[model.id]
                            downloadedModel[model.id].visible = true
                        }
                    }else{
                        let modelObject = await this.DownloadModelGltf(this.props.modelUrl[model.id]);
                        modelObject.idTab = tabAttributeId
                        if(tabAttributeId == 1461) {
                            modelObject.position.set(2, 0, 0)
                        }
                        else{
                            modelObject.position.set(-2, 0, 0)
                        }

                        if(objectStateContainer[tabAttributeId] && objectStateContainer[tabAttributeId].idTab === modelObject.idTab){
                            objectStateContainer[tabAttributeId].visible = false
                            objectStateContainer[tabAttributeId] = modelObject
                            modelObject.visible = true
                        }
                        else{
                            objectStateContainer[tabAttributeId] = modelObject
                            modelObject.visible = true
                        }
                        downloadedModel[model.id] = modelObject;
                        this.scene.add(modelObject)
                    }
                },this)
            }
        }
    },this)
}
    handleWindowResize = () => {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        this.renderer.setSize( width, height );
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }; 
    render() {
        console.log(this.props.modelOptions);
        if(this.props.modelOptions && this.props.modelOptions.length > 0){
            this.initThreeCanvas();
        }
        const style = {width:'580px',height:'453px',marginTop:'70px'};
        return (
        <div className="left-section"> 
            <div style={style} ref={ref => (this.mount = ref)} />
        </div>
        );
    }
}
