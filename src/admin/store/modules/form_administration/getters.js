


export const getFormConfigById = state => {

    return (id) => {
        return state.form_configurations.find(fconfig => {
            return fconfig.id === id
        });
    }
}
