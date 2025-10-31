(function probeEarlyCalls() {
    console.log('Setting up early native call probe');
  const bridge: any = (global as any).__fbBatchedBridge;
  if (!bridge) return;
  const orig = bridge.enqueueNativeCall;
  if (typeof orig === 'function') {
    bridge.enqueueNativeCall = function (moduleID, methodID, params, onFail, onSucc) {
        console.log(`Native call enqueued: moduleID=${moduleID}, methodID=${methodID}`);
      try {
        // weak mapping—but good enough to spot RCTEventEmitter
        const names = Object.keys(bridge._callableModules || {});
        if (!names.includes('RCTEventEmitter')) {
          console.log('EARLY NATIVE CALL before RCTEventEmitter registered', { moduleID, methodID });
        }
      } catch (e) {
        console.warn('Error probing early native calls', e);
      }
      return orig.apply(this, arguments);
    };
  }
})();