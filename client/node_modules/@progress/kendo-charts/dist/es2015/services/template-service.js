let current = {
    compile: function(template) {
        return template;
    }
};

class TemplateService {
    static register(userImplementation) {
        current = userImplementation;
    }

    static compile(template) {
        return current.compile(template);
    }
}

export default TemplateService;
