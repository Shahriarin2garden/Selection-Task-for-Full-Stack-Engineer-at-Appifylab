'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { register, AuthState } from '@/app/actions/auth';

const initialState: AuthState = undefined;

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, initialState);

  return (
    <section className="_social_registration_wrapper _layout_main_wrapper">
      <div className="_shape_one">
        <img src="/images/shape1.svg" alt="" className="_shape_img" />
        <img src="/images/dark_shape.svg" alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <img src="/images/shape2.svg" alt="" className="_shape_img" />
        <img src="/images/dark_shape1.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_shape_three">
        <img src="/images/shape3.svg" alt="" className="_shape_img" />
        <img src="/images/dark_shape2.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  <img src="/images/registration.png" alt="Registration illustration" />
                </div>
                <div className="_social_registration_right_image_dark">
                  <img src="/images/registration1.png" alt="Registration illustration dark" />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">
                <div className="_social_registration_right_logo _mar_b28">
                  <div className="_right_logo" style={{ fontSize: '24px', fontWeight: '800', color: '#1890FF', fontFamily: 'Poppins, sans-serif' }}>
                    BuddyScript
                  </div>
                </div>
                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>
                <button type="button" className="_social_registration_content_btn _mar_b40">
                  <img src="/images/google.svg" alt="Google" className="_google_img" />
                  <span>Register with google</span>
                </button>
                <div className="_social_registration_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                <form className="_social_registration_form" action={formAction}>
                  <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          className={`form-control _social_registration_input${state?.errors?.firstName ? ' is-invalid' : ''}`}
                          placeholder="First name"
                          required
                        />
                        {state?.errors?.firstName && (
                          <div className="invalid-feedback">{state.errors.firstName[0]}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          className={`form-control _social_registration_input${state?.errors?.lastName ? ' is-invalid' : ''}`}
                          placeholder="Last name"
                          required
                        />
                        {state?.errors?.lastName && (
                          <div className="invalid-feedback">{state.errors.lastName[0]}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Email</label>
                        <input
                          type="email"
                          name="email"
                          className={`form-control _social_registration_input${state?.errors?.email ? ' is-invalid' : ''}`}
                          placeholder="Email address"
                          required
                        />
                        {state?.errors?.email && (
                          <div className="invalid-feedback">{state.errors.email[0]}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Password</label>
                        <input
                          type="password"
                          name="password"
                          className={`form-control _social_registration_input${state?.errors?.password ? ' is-invalid' : ''}`}
                          placeholder="Password (min 8 characters)"
                          required
                        />
                        {state?.errors?.password && (
                          <div className="invalid-feedback">{state.errors.password[0]}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Repeat Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          className={`form-control _social_registration_input${state?.errors?.confirmPassword ? ' is-invalid' : ''}`}
                          placeholder="Confirm password"
                          required
                        />
                        {state?.errors?.confirmPassword && (
                          <div className="invalid-feedback">{state.errors.confirmPassword[0]}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                      <div className="form-check _social_registration_form_check">
                        <input
                          className="form-check-input _social_registration_form_check_input"
                          type="checkbox"
                          name="agreeTerms"
                          id="agreeTerms"
                          required
                        />
                        <label className="form-check-label _social_registration_form_check_label" htmlFor="agreeTerms">
                          I agree to terms &amp; conditions
                        </label>
                        {state?.errors?.agreeTerms && (
                          <div style={{ color: '#dc3545', fontSize: '13px' }}>{state.errors.agreeTerms[0]}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                        <button type="submit" className="_social_registration_form_btn_link _btn1" disabled={isPending}>
                          {isPending && <span className="spinner" />}
                          {isPending ? 'Creating account...' : 'Create Account'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_registration_bottom_txt">
                      <p className="_social_registration_bottom_txt_para">
                        Already have an account?{' '}
                        <Link href="/login">Login now</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
