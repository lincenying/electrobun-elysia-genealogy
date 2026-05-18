import Twig from 'twig'

import { getTemplateDir } from '~/utils'

export class AdminTemplateController {
    public static async genealogyTemplate() {
        const templateDir = getTemplateDir('./views/genealogy.twig')
        const html = await new Promise<string>((resove) => {
            Twig.renderFile(templateDir, { title: '族谱' }, (err, html) => {
                resove(err ? err.toString() : html)
            })
        })
        return html
    }
}
