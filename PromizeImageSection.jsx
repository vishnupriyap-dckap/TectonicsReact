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

    /* download image from url */
    downloadImage = (url) => {
        return new Promise((resolve, reject) => {
            let img = new Image()
            img.addEventListener('load', e => resolve(img))
            img.addEventListener('error', () => {
                reject(new Error(`Failed to load image from URL: ${url}`))
            })
            img.src = url
        })
    }

    /* initialize scene */
    sceneSetup () {
        return new Promise(async function (resolve) {
            const width = this.threeContainer.clientWidth;
            const height = this.threeContainer.clientHeight;
    
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
            this.controls = new THREE.OrbitControls(this.camera, this.threeContainer);
    
            /* create webgl renderer */
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setSize(width, height);
            this.threeContainer.appendChild(this.renderer.domElement);
    
            /* create dummey texture for fabric canvas */
            this.whiteImage = await this.downloadImage('white.jpg')
            resolve()

        }.bind(this))
    }

    /* start rendering */
    startAnimationLoop = () => {
        this.renderer.render(this.scene, this.camera);
        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    }

    /* download hdri */
    initHdri = (url) => {
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
    downloadModelGltf = (modelUrl) => {
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

    /* apply color to fabric texture */
    applyColorToFabric = (fabricCanvas, colorCode) => {
        if (fabricCanvas.backgroundImage.filters.length === 0) {
            fabricCanvas.backgroundImage.filters.push(new fabric.Image.filters.BlendColor({
                color: colorCode,
                mode: 'multiply'
            }))
        } else {
            fabricCanvas.backgroundImage.filters[0].color = colorCode
        }
        fabricCanvas.backgroundImage.applyFilters()
        fabricCanvas.renderAll()
    }

    /* sets the background image of the fabric canvas */
    applyTextureToCanvas = (texture, textureWidth, fabricCanvas) => {
        let image = new fabric.Image(texture, {
            left: fabricCanvas.width / 2,
            top: fabricCanvas.height / 2,
            angle: 0,
            opacity: 1,
            originX: "center",
            originY: "center",
            scaleX: fabricCanvas.width / textureWidth,
            scaleY: fabricCanvas.width / textureWidth
        })

        /* apply the settings for the background image */
        fabricCanvas.setBackgroundImage(image, this.applyTextureSettings.bind(this, fabricCanvas))
    }

    /* custom functions to manipulate Fabric canvas background image */
    applyTextureSettings = (fabricCanvas) => {
        // fabricCanvas.backgroundImage.flipY = true
        fabricCanvas.renderAll()
    }

    /* init canvas texture and apply to the material */
    createCanvasTexture = (/* assetData,  */material) => {
        /* local variables */
        // let mask = null
        // let boundingBox = null
        // let canvasData = null
        // let canvasReference = {}

        // /* get target information globally for calculations */
        // let targetTransformationCache = {
        //     targetLastAngleValue: 0,
        //     targetLastPositionX: 0,
        //     targetLastPositionY: 0,
        //     targetLastScalingValue: 0
        // }
        // canvasReference.targetTransformationCache = targetTransformationCache

        // /* get canvas data from asset data */
        // Object.keys(assetData.twoData.canvasList).forEach((key) => {
        //     if (key === material.name) {
        //         canvasData = assetData.twoData.canvasList[key]
        //     }
        // })

        /* Init canvas ui and fabric canvas */
        /* get fabric container html element */
        // let fabricContainer = document.getElementById("fabric-container")

        /* create canvas element and init default value */
        let canvasElement = document.createElement("canvas")
        this.fabricContainer.appendChild(canvasElement)
        // if (canvasData.width && canvasData.height) {
        //     canvasElement.setAttribute("width", canvasData.width + 'px')
        //     canvasElement.setAttribute("height", canvasData.height + 'px')
        // } else {
        //     console.error('canvas texture dimensions undefined', canvasData)
        // }
        // fabricContainer.appendChild(canvasElement)

        /* init fabric canvas */
        /* disable retina scaling which causes issue in the mobile devices and preserveObjectStacking for keeping the layer order
        disable group selection in the fabric canvas */
        let fabricCanvas = new fabric.Canvas(canvasElement, { enableRetinaScaling: false, preserveObjectStacking: true, selection: false })
        fabricCanvas.setHeight(2048);
        fabricCanvas.setWidth(2048);
        let canvasContainer = canvasElement.parentElement
        // canvasContainer.setAttribute("id", material.name)
        // for (let i = 0; i < canvasContainer.childNodes.length; i++) {
        //     if (canvasContainer.childNodes[i].className == 'lower-canvas') {
        //         canvasContainer.childNodes[i].id = material.name
        //         break
        //     }
        // }
        /* hide the fabric canvas once initiated */
        canvasContainer.style.position = 'absolute'
        canvasContainer.style.visibility = 'hidden'
        canvasContainer.style.position = 'absolute'
        // canvasReference.fabricCanvas = fabricCanvas

        if (material.map) {
            /* apply texture (background image) to canvas */
            this.applyTextureToCanvas(material.map.image, material.map.width, fabricCanvas)
        }
        else {
            /* create a rectangle with a white fill */

            /* apply texture (background image) to canvas */
            this.applyTextureToCanvas(this.whiteImage, this.whiteImage.width, fabricCanvas)
        }

        // /* create mask object */
        // if (canvasData.containsMask) {
        //     mask = CreateMaskObject(canvasData, fabricCanvas)
        //     canvasReference.mask = mask
        // }

        // /* init bounding box */
        // if (canvasData.containsBoundingBox) {
        //     boundingBox = new fabric.Rect(canvasData.boundingBox)
        //     fabricCanvas.add(boundingBox)
        //     canvasReference.boundingBox = boundingBox
        // }

        // /* create initial objects on fabric canvas */
        // CreateInitialObjects(canvasData, canvasReference, assetData.twoData.fontsList)

        // /* init events logic */
        // /* init logic on fabric onTextChanged event */
        // OnFabricTextChanged(canvasData, canvasReference)

        // /* init logic on fabric onObjectMoving event */
        // OnFabricObjectMoving(canvasData, canvasReference)

        // /* init logic on fabric onObjectMoved event */
        // OnFabricObjectMoved(canvasReference)

        // /* init logic on fabric onObjectRotating event */
        // OnFabricObjectRotating(canvasData, canvasReference)

        // /* init logic on fabric onObjectRotated event */
        // OnFabricObjectRotated(canvasReference)

        // /* init logic on fabric onObjectScaling event */
        // OnFabricObjectScaling(canvasData, canvasReference)

        // /* init logic on fabric onObjectScaled event */
        // OnFabricObjectScaled(canvasReference)

        // /* init logic onFabricSelectionCreated event */
        // OnFabricSelectionCreated(canvasData, canvasReference, /* typeUiReference */)

        // /* init logic onFabricSelectionCleared event */
        // OnFabricSelectionCleared(canvasData, canvasReference, /* typeUiReference */)

        // /* init logic on onMouseDown event */
        // OnFabricMouseDown(canvasReference)

        // /* init logic on onMouseUp event */
        // OnfabricMouseUp(canvasReference)

        // /* init logic on afterFabricCanvasRender event */
        // OnFabricAfterRender(canvasReference, material)

        // /* add mouse or touch events to fabric canvas */
        // AddMouseOrTouchListnerToFabric(canvasReference)

        // /* add uiDataReference to the fabric object */
        // fabricCanvas.userData = {}
        // /* fabricCanvas.userData.uiData = typeUiReference */
        // fabricCanvas.userData.canvasData = canvasData

        /* add fabric canvas texture reference to the material */
        material.userData.fabricCanvas = fabricCanvas

        // /* on reset functionality */
        // uiReference.parentNodes.resetButton.addEventListener('reset', () => {
        //     /* remove all the objects from canvas */
        //     fabricCanvas.remove.apply(fabricCanvas, fabricCanvas.getObjects())

        //     /* create initial objects on fabric canvas */
        //     CreateInitialObjects(canvasData, canvasReference, assetData.twoData.fontsList)
        //     fabricCanvas.renderAll()
        // })

        /* return canvas */
        return fabricCanvas.lowerCanvasEl
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
                                this.hdri = await this.initHdri('https://devcloud.productimize.com/cms/wp-content/themes/salient-child/View360/three_js_multi_fabric_multi_object_2/projects/_global_assets_/assets_3d/high_quality/hdri_images/sphere_mapping/studio015small.jpg')

                            /* download model */
                            let modelObject = await this.downloadModelGltf(this.props.modelUrl[model.id]);

                            /* loop through object */
                            modelObject.traverse(
                                (child) => {
                                    if (child.isMesh) {
                                        /* apply hdri map */
                                        if (child.material.userData.envMapNeeded)
                                            child.material.envMap = this.hdri

                                        /* apply canvas texture */
                                        if (child.material.userData.canvasTexture) {
                                            /* create canvas texture */
                                            let canvasTexture = this.createCanvasTexture(child.material)
                                    
                                            /* apply canvas texture */
                                            child.material.map = new THREE.CanvasTexture(canvasTexture)

                                            /* texture settings */
                                            child.material.map.encoding = THREE.sRGBEncoding
                                            child.material.map.anisotropy = 16
                                            child.material.map.flipY = false

                                            /* apply color to canvas */
                                            this.applyColorToFabric(child.material.userData.fabricCanvas, '#fc0303')
                                        }
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
    async initThreeCanvas() {
        if (!modelRendred) {
            await this.sceneSetup();
            this.startAnimationLoop();
            modelRendred = true;
        }
        this.loadModel();
    }

    /* on window resize event */
    handleWindowResize = () => {
        const width = this.threeContainer.clientWidth;
        const height = this.threeContainer.clientHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    render() {
        if (this.props.modelOptions && this.props.modelOptions.length > 0) {
            this.initThreeCanvas();
        }
        const threeStyle = { width: '580px', height: '453px', marginTop: '70px' };
        return (
            <div className="left-section">
                <div id="three-container" style={threeStyle} ref={ref => (this.threeContainer = ref)} />
                <div id="fabric-container" ref={ref => (this.fabricContainer = ref)} />
            </div>
        );
    }
}
