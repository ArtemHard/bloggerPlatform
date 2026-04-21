export const emailExamples = {
    registrationEmail(code: string) {
        return ` <div>
           <h1>HI MAN, YO</h1>
           <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
      </div>`
    },
    passwordRecoveryEmail(code: string) {
            return `<div>
           <h1>Password recovery</h1>
           <p>To finish password recovery please follow the link below:
              <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
           </p>
      </div>`
    }
}