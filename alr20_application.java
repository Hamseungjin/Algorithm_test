import java.time.LocalDateTime;

@Entity
@Table(name="ALR20_APPLCIATION")
@Builder@Getter@Setter
@ALLArgConstructor(access= AccessLevel.PRIVATE)
@NoArgsConstructor(access= AccessLevel.PRIVATE)
public class alr20_application {
    @Id @GeneratedValue
    @Enumerated(EnumType.STRING)
    @NotNull
    private ContestField contestField;
    @NotNull
    pirvate String projectName;

    @OneToOne(fetch = FetchType.LAZY, orphanRemoval =true)
    @JoinColum(name ="PERSONAL_INFO_CONSENT_ID" ,nullable = false)
    private PersonalInfoConsent personalInfoConsent; // 개인정보 제공 약관 ID

    @OneToOne(fetch = FetchType.LAZY, orphanRemoval =true) 
    @JoinColum(name ="COPYRIGHT_CONSENT_ID" ,nullable = false) // 저작권 동의 약관 ID

    @OneToOne(fetch = FetchType.LAZY, orphanRemoval =true)
    @JoinColum(name ="IDEA_PLAN_FILE_ID" ,nullable = false) // 아이디어 파일 ID

    @OneToOne(fetch = FetchType.LAZY, orphanRemoval =true)
    @JoinColum(name ="IDEA_SUMMARY_FILE_ID" ,nullable = false) // 아이디어 요약서 파일 ID

    @CreatedDate
    @NotnNull
    private LocalDataTime createdDate;

    @LastModifiedDate
    private LocalDateTime modifiedDate;

    @OneToOne(fetch = FetchType.LAZY, orphanRemoval =true)
    @JoinColum(name ="SURVEY_ID" ,nullable = false)
    private Survey survey;

    public void setSurvey(Survey survey) {this.survey =survey;}

    
}
