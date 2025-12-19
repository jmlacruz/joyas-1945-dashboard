export type TSaveBtnStatusValue = 'Publish' | 'Guardar' | 'Saving' | 'Saved';
export type TSaveBtnStatus = {
	[key in 'PUBLISH' | 'SAVE' | 'SAVING' | 'SAVED']: TSaveBtnStatusValue;
};
