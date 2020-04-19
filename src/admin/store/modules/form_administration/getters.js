


export const getFormConfigById = state => {

    return (id) => {
        return state.form_configurations.find(fconfig => {
            return fconfig.id === id
        });
    }
}

export const getFormConfigByName = state => {
    return (name) => {
        return state.form_configurations.find(fconfig => {
            return fconfig.name === name;
        })
    }
}
