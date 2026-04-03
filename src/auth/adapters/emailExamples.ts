export const emailExamples = {
    registrationEmail(code: string) {
        return ` <div>
           <h1>HI MAN, YO</h1>
           <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
      </div>`
    },
    passwordRecoveryEmail(code: string) {
            return `<div>
           <h1>HI MAN, YO</h1>
           <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
      </div>`
    }
}