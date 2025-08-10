// This file is a workaround for create-react-app's lack of native worker support.
// It uses worker-loader to inline the worker as a blob.
// eslint-disable-next-line
import Worker from 'worker-loader!./search.worker';

const workerLoader = () => {
    return new Worker();
}

export default workerLoader;
