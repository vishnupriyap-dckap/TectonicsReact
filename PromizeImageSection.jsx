let downloadedModel = {};
let modelRendred = false;
let hdriDownloaded = false;
class PromizeImageSection extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            modelRendred: false,
        }
    }
    componentDidMount() {
        // window.addEventListener('resize', this.handleWindowResize);
    }

    /* initialize scene */
    async sceneSetup () {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        /* create scene */
        this.scene = new THREE.Scene();

        /* create camera object */
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 9;

        /* add light to the scene */
        const light = new THREE.AmbientLight(0xcfcfcf);
        this.scene.add(light);  

        /* maintains the currently loaded object in the scene */
        const currentlyLoadedObject = new THREE.Group()
        currentlyLoadedObject.name = 'currentlyLoadedObject'
        this.scene.add(currentlyLoadedObject)

        /* create orbit controls */
        this.controls = new THREE.OrbitControls(this.camera, this.mount);

        /* create webgl renderer */
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.mount.appendChild(this.renderer.domElement);
    }

    /* start rendering */
    startAnimationLoop = () => {
        this.renderer.render(this.scene, this.camera);
        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    }

    /* download hdri */
    InitHdri = (url) => {
        return new Promise((resolve, reject) => {
            let textureLoader = new THREE.TextureLoader()
            textureLoader.load(url,
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

    /* load model into the scene */
    loadModel = () => {
        let currentlyLoadedObject = this.scene.getObjectByName('currentlyLoadedObject')
        this.props.modelOptions && this.props.modelOptions.map((defaultOption) => {
            for (let tabAttributeId in defaultOption) {
                if (defaultOption.hasOwnProperty(tabAttributeId)) {
                    let modelsData = JSON.parse(defaultOption[tabAttributeId])
                    modelsData && modelsData.map(async function (model) {
                        if (downloadedModel[model.id]) {
                            if (currentlyLoadedObject[tabAttributeId] && currentlyLoadedObject[tabAttributeId].idTab === downloadedModel[model.id].idTab) {
                                currentlyLoadedObject[tabAttributeId].visible = false
                                currentlyLoadedObject[tabAttributeId] = downloadedModel[model.id]
                                downloadedModel[model.id].visible = true
                            }
                        } else {
                            /* download hdri */
                            if(!hdriDownloaded) 
                                this.hdri = await this.InitHdri('https://devcloud.productimize.com/cms/wp-content/themes/salient-child/View360/three_js_multi_fabric_multi_object_2/projects/_global_assets_/assets_3d/high_quality/hdri_images/sphere_mapping/studio015small.jpg')

                            /* download model */
                            let modelObject = await this.DownloadModelGltf(this.props.modelUrl[model.id]);

                            /* loop through object */
                            modelObject.traverse(
                                (child) => {
                                    if (child.isMesh) {
                                        /* apply hdri map */
                                        if (child.material.userData.envMapNeeded)
                                            child.material.envMap = this.hdri
                                    }
                                }
                            )
                            modelObject.idTab = tabAttributeId

                            if (currentlyLoadedObject[tabAttributeId] && currentlyLoadedObject[tabAttributeId].idTab === modelObject.idTab) {
                                currentlyLoadedObject[tabAttributeId].visible = false
                                currentlyLoadedObject[tabAttributeId] = modelObject
                                modelObject.visible = true
                            }
                            else {
                                currentlyLoadedObject[tabAttributeId] = modelObject
                                modelObject.visible = true
                            }
                            downloadedModel[model.id] = modelObject;
                            this.scene.add(modelObject)
                        }
                    }, this)
                }
            }
        }, this)
    }

    /* init 360 view */
    initThreeCanvas() {
        if (!modelRendred) {
            this.sceneSetup();
            this.startAnimationLoop();
            modelRendred = true;
        }
        this.loadModel();
    }

    /* on window resize event */
    handleWindowResize = () => {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    render() {
        if (this.props.modelOptions && this.props.modelOptions.length > 0) {
            this.initThreeCanvas();
        }
        const style = { width: '580px', height: '453px', marginTop: '70px' };
        return (
            <div className="left-section">
                <div style={style} ref={ref => (this.mount = ref)} />
            </div>
        );
    }
}
