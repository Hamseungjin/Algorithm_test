package mil.af.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "ALR20_RECOGNITION_PATH")
@Getter
@Setter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class alr20_recognition_path {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RECOGNITION_PATH_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SURVEY_ID", nullable = false)
    private alr20_survey survey;

    @Enumerated(EnumType.STRING)
    @Column(name = "PATH_TYPE", nullable = false, length = 30)
    @NotNull
    private RecognitionPathType pathType;

    public enum RecognitionPathType {
        SNS,
        EMAIL,
        INTRANET,
        OFFLINE_NOTICE,
        WORD_OF_MOUTH,
        ETC
    }
}
